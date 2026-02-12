from enum import Enum

class ErrorMessage(Enum):
    NO_INTERNET_CONNECTION = 1
    UNABLE_TO_DOWNLOAD_MODEL = 2
    MODEL_EXISTS = 3
    INVALID_PATH = 4
    MODEL_NAME_MISSING = 5

MESSAGE_MAP: dict[ErrorMessage, str] = {
    ErrorMessage.NO_INTERNET_CONNECTION: "No internet connection detected",
    ErrorMessage.UNABLE_TO_DOWNLOAD_MODEL: "Unable to download model",
    ErrorMessage.MODEL_EXISTS: "Model already exists on system",
    ErrorMessage.INVALID_PATH: "The provided path is invalid",
    ErrorMessage.MODEL_NAME_MISSING: "Model name is missing in input",
}

ERROR_CODE_MAP: dict[ErrorMessage, int] = {
    ErrorMessage.NO_INTERNET_CONNECTION: 400,
    ErrorMessage.UNABLE_TO_DOWNLOAD_MODEL: 500,
    ErrorMessage.MODEL_EXISTS: 400,
    ErrorMessage.INVALID_PATH: 400,
    ErrorMessage.MODEL_NAME_MISSING: 400,
}