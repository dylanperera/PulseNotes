from enum import Enum

class ErrorMessage(Enum):
    NO_INTERNET_CONNECTION = 1
    UNABLE_TO_DOWNLOAD_MODEL = 2
    MODEL_EXISTS = 3
    INVALID_PATH = 4
    MODEL_NAME_MISSING = 5
    MODEL_DOES_NOT_EXIST = 6
    COULD_NOT_DELETE_MODEL = 7

MESSAGE_MAP: dict[ErrorMessage, str] = {
    ErrorMessage.NO_INTERNET_CONNECTION: "No internet connection detected",
    ErrorMessage.UNABLE_TO_DOWNLOAD_MODEL: "Unable to download model",
    ErrorMessage.MODEL_EXISTS: "Model already exists on system",
    ErrorMessage.INVALID_PATH: "The provided path is invalid",
    ErrorMessage.MODEL_NAME_MISSING: "Model name is missing in input",
    ErrorMessage.MODEL_DOES_NOT_EXIST: "The model you are trying to access or delete does not exist",
    ErrorMessage.COULD_NOT_DELETE_MODEL: "Could not delete model"
}

ERROR_CODE_MAP: dict[ErrorMessage, int] = {
    ErrorMessage.NO_INTERNET_CONNECTION: 400,
    ErrorMessage.UNABLE_TO_DOWNLOAD_MODEL: 500,
    ErrorMessage.MODEL_EXISTS: 400,
    ErrorMessage.INVALID_PATH: 400,
    ErrorMessage.MODEL_NAME_MISSING: 400,
    ErrorMessage.MODEL_DOES_NOT_EXIST: 400,
    ErrorMessage.COULD_NOT_DELETE_MODEL: 500
}