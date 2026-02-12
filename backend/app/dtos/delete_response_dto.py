from pydantic import BaseModel

class DeleteResponseDTO(BaseModel):
    message: str
    status_code: int