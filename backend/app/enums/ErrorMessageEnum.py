from enum import Enum

class ErrorMessage(Enum):
    NO_INTERNET_CONNECTION = 1
    UNABLE_TO_DOWNLOAD_MODEL = 2
    MODEL_EXISTS = 3
    INVALID_PATH = 4
    MODEL_NAME_MISSING = 5