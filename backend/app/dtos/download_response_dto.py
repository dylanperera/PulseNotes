from pydantic import BaseModel, ConfigDict

class DownloadResponseDTO(BaseModel):

    message: str
