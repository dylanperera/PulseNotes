from pydantic import BaseModel, ConfigDict
from app.enums.ErrorMessageEnum import ErrorMessage

class DownloadResponseDTO(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    message: str
    error: ErrorMessage | None = None