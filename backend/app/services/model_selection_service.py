from collections import defaultdict
from ..dto.model_availability_dto import ModelAvailabilityDTO
import psutil
import logging

logger = logging.getLogger(__name__)

class ModelSelectionService():

    models = defaultdict(float)

    def __init__(self):

        # Model sizes
        self.models = {
                        "llama3.2": 0.8,
                        "medi-phi": 2.1,
                        "large-model": 4.9
                      }

    def check_available_models(self, path):
        # Get the current available local disk space and the available RAM
        result: list[ModelAvailabilityDTO] = []
        ram_stats = psutil.virtual_memory()
        
        disk_stats = psutil.disk_usage(path)

        # Values in GB
        total_ram = self.bytes_to_gigabytes(ram_stats.total)
        free_ram = self.bytes_to_gigabytes(ram_stats.available)
        free_local_space = self.bytes_to_gigabytes(disk_stats.free)

        for name, size in self.models.items():
            model_dto = ModelAvailabilityDTO(name)
            
            # Determine if model is even supported
            if (size * 2) > total_ram or free_local_space <= size:
                model_dto.reason = "Model not supported on device, insufficient memory"
            else:
                model_dto.supported = True

                # check if model exists in app data

                # Check if the model can be used right now based on current RAM
                if size < free_ram: # We can play around with this depdending on our context size
                    model_dto.usable_now = True
                else:
                    model_dto.reason = "Not enough RAM to currently support model"

            result.append(model_dto)

        return result
    
    def bytes_to_gigabytes(self, num_bytes):
        return num_bytes / (1024 ** 3)