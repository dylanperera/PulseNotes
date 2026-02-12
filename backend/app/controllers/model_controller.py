from .base_controller import Controller
from app.services.model_services import ModelServices
from app.enums.ErrorMessageEnum import ErrorMessage
from app.dtos.download_response_dto import DownloadResponseDTO


class ModelController(Controller):
    
    def __init__(self):
        super().__init__()
        self.model_services = ModelServices()

    def get_models_status(self, path):

        # Check if string is empty
        if not path:
            return Exception("No path specified")

        result = self.model_services.check_available_models(path)

        return result
    
    def download_new_model(self, path, model_name):
        
        if not path:
            return DownloadResponseDTO(message="Invalid Path", error=ErrorMessage.INVALID_PATH)

        if not model_name:
            return DownloadResponseDTO(message="Model name not provided", error=ErrorMessage.MODEL_NAME_MISSING)

        result = self.model_services.download_model(path, model_name)

        if result is None:
            return DownloadResponseDTO(message="Success", error=None)

        if result == ErrorMessage.NO_INTERNET_CONNECTION:
            return DownloadResponseDTO(message="Connect to internet in order to download model", error=ErrorMessage.NO_INTERNET_CONNECTION)
        
        if result == ErrorMessage.MODEL_EXISTS:
            return DownloadResponseDTO(message="Model already exists on device", error=ErrorMessage.MODEL_EXISTS)
       
        if result == ErrorMessage.UNABLE_TO_DOWNLOAD_MODEL:
            return DownloadResponseDTO(message="Unable to download model", error=ErrorMessage.UNABLE_TO_DOWNLOAD_MODEL)

    # def remove_model_from_disk(self, path, model_):
    #     pass

    

    