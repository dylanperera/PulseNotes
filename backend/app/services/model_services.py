from app.dtos.model_availability_dto import ModelAvailabilityDTO
from app.enums.ErrorMessageEnum import ErrorMessage
from pathlib import Path
from app.registry.model_registry import MODEL_REGISTRY
import psutil
import logging
import requests
import os
from huggingface_hub import hf_hub_download

logger = logging.getLogger(__name__)


class ModelServices:

    def __init__(self):
        Path("models/transcription").mkdir(parents=True, exist_ok=True)
        Path("models/summarization").mkdir(parents=True, exist_ok=True)

    def _get_model(self, model_name):
        for model in MODEL_REGISTRY:
            if model["model_download_name"] == model_name:
                return model
        return None

    def check_available_models(self):

        result = []

        ram_stats = psutil.virtual_memory()
        disk_stats = psutil.disk_usage("/")
        total_ram = self._bytes_to_gigabytes(ram_stats.total)
        free_ram = self._bytes_to_gigabytes(ram_stats.available)
        free_disk = self._bytes_to_gigabytes(disk_stats.free)

        for model in MODEL_REGISTRY:

            dto = ModelAvailabilityDTO(
                model_download_name=model["model_download_name"],
                model_display_name=model["model_display_name"],
                model_description=model["model_description"],
                model_type=model["model_type"],
                downloaded=False,
                supported=False,
                usable_now=False,
                reason=""
            )

            file_path = Path(model["local_path"]) / model["file"]

            if file_path.exists():
                dto.downloaded = True

            size = model["size"]

            if (size * 2) > total_ram or size > free_disk:
                dto.reason = "Insufficient memory or disk space"
                result.append(dto)
                continue

            dto.supported = True
            if size > free_ram:
                dto.reason = "Not enough RAM currently available"
                result.append(dto)
                continue

            dto.usable_now = True

            result.append(dto)

        return result

    def download_model(self, model_name):

        model = self._get_model(model_name)

        if not model:
            return ErrorMessage.MODEL_DOES_NOT_EXIST

        file_path = Path(model["local_path"]) / model["file"]

        if file_path.exists():
            return ErrorMessage.MODEL_EXISTS

        if not self._check_internet_connection():
            return ErrorMessage.NO_INTERNET_CONNECTION

        try:

            if model["source"] == "huggingface":

                hf_hub_download(
                    repo_id=model["repo"],
                    filename=model["file"],
                    local_dir=model["local_path"]
                )

            elif model["source"] == "url":

                response = requests.get(model["download_url"], stream=True)

                with open(file_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

            else:
                return ErrorMessage.UNABLE_TO_DOWNLOAD_MODEL

        except Exception as e:
            logger.error(f"Model download failed: {e}")
            return ErrorMessage.UNABLE_TO_DOWNLOAD_MODEL

        return None

    def delete_model(self, model_name):

        model = self._get_model(model_name)

        if not model:
            return ErrorMessage.MODEL_DOES_NOT_EXIST

        file_path = Path(model["local_path"]) / model["file"]

        if not file_path.exists():
            return ErrorMessage.MODEL_DOES_NOT_EXIST

        os.remove(file_path)

        return None

    def _bytes_to_gigabytes(self, num_bytes):
        return num_bytes / (1024 ** 3)

    def _check_internet_connection(self):
        try:
            url = os.getenv("INTERNET_CONNECTION_TEST_URL", "https://www.google.com")
            requests.get(url, timeout=5)
            return True
        except requests.ConnectionError:
            return False