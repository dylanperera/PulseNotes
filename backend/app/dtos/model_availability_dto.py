from pydantic import BaseModel
class ModelAvailabilityDTO(BaseModel):


    model_download_name: str
    model_display_name: str
    model_description: str
    model_type: str

    downloaded: bool = False
    supported: bool = False
    usable_now: bool = False
    reason: str = ""