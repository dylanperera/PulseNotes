from .base_controller import Controller
from app.services.model_services import ModelServices
from app.enums.ErrorMessageEnum import MESSAGE_MAP, ERROR_CODE_MAP
from app.dtos.download_response_dto import DownloadResponseDTO
from app.dtos.delete_response_dto import DeleteResponseDTO
from app.dtos.success_dto import SuccessDTO
from app.dtos.error_dto import ErrorDTO


class ModelController(Controller):
    def __init__(self):
        super().__init__()
        self.model_services = ModelServices()

    def get_models_status(self, path):

        result = self.model_services.check_available_models(path)

        if isinstance(result, list):
            return SuccessDTO(result=result, status_code=200)
        else:
            return ErrorDTO(
                message=MESSAGE_MAP[result],
                status_code=ERROR_CODE_MAP[result]
            )

    def download_new_model(self, model_name, path):
        result = self.model_services.download_model(model_name, path)

        if result is None:
            return SuccessDTO(
                result=DownloadResponseDTO(message="Successfully downloaded model"),
                status_code=200
            )
        else:
            return ErrorDTO(
                message=MESSAGE_MAP[result],
                status_code=ERROR_CODE_MAP[result]
            )

    def remove_model_from_disk(self, model_name, path):

        result = self.model_services.delete_model(model_name, path)

        if result is None:
            return SuccessDTO(
                result=DeleteResponseDTO(message="Successfully deleted model"),
                status_code=200
            )
        else:
            return ErrorDTO(
                message=MESSAGE_MAP[result],
                status_code=ERROR_CODE_MAP[result]
            )