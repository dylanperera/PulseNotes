from pydantic import BaseModel

class DeleteResponseDTO(BaseModel):
    message: str

