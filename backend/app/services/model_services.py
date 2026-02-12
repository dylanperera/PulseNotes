from collections import defaultdict
from app.dtos.model_availability_dto import ModelAvailabilityDTO
from app.enums.ErrorMessageEnum import ErrorMessage
import psutil
import logging
import requests
import os
from huggingface_hub import hf_hub_download
from pathlib import Path

logger = logging.getLogger(__name__)

class ModelServices():

    models = defaultdict(float)

    def __init__(self):

        # Model sizes
        self.models = {
                        "llama3.2": 0.893,
                        "medi-phi": 2.1,
                        "large-model": 4.9
                      }

    def check_available_models(self, path):
        # Get the current available local disk space and the available RAM
        result: list[ModelAvailabilityDTO] = []
        ram_stats = psutil.virtual_memory()
        
        disk_stats = psutil.disk_usage(path)

        # Values in GB
        total_ram = self._bytes_to_gigabytes(ram_stats.total)
        free_ram = self._bytes_to_gigabytes(ram_stats.available)
        free_local_space = self._bytes_to_gigabytes(disk_stats.free)

        for name, size in self.models.items():

            model_dto = ModelAvailabilityDTO(model_name=name)
            
            result.append(model_dto)
            
            # Determine if model is even supported
            if (size * 2) > total_ram or free_local_space <= size:
                model_dto.reason = "Model not supported on device, insufficient memory"
                continue
            else:
                model_dto.supported = True
    
            # Check if the model can be used right now based on current RAM
            if size >= free_ram: # We can play around with this depdending on our context size
                model_dto.reason = "Not enough RAM to currently support model"
                continue
            else:
                model_dto.usable_now = True

            # check if model exists in app data
            if not self._check_if_model_exists(path, name):
                model_dto.reason = "Model must be downloaded - Please connect to internet to try downloading"
                continue
            else:
                model_dto.downloaded = True

        return result
    
    def download_model(self, path, model_name):
        # Check if the model is downloaded in the app data directory
        if(self._check_if_model_exists(path, model_name)):
            return ErrorMessage.MODEL_EXISTS

        # Check if connected to network
        if(self._check_internet_connection() == False):
            return ErrorMessage.NO_INTERNET_CONNECTION

        # If we get here, that means model has not been downloaded, so we must download it
        try:
            hf_repo_url = os.getenv("HF_MODELS_REPO_ID", "DylanPerera1/pulsenotes-med-models")
            hf_hub_download(repo_id = hf_repo_url, 
                            filename = model_name, 
                            local_dir = path,
                           )
        except:
            return ErrorMessage.UNABLE_TO_DOWNLOAD_MODEL
        
        return None


    def _bytes_to_gigabytes(self, num_bytes):
        return num_bytes / (1024 ** 3)
    

    def _check_if_model_exists(self, path, model_name):

        path = Path(path) / model_name
        if path.exists():
            return True
        else:
            return False


    def _check_internet_connection(self):
        try:
            url = os.getenv("INTERNET_CONNECTION_TEST_URL", "https://www.google.com")
            requests.get(url, timeout=5)
            return True
        except requests.ConnectionError:
            return False