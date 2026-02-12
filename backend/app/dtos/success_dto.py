from pydantic import BaseModel, ConfigDict
from typing import Any

class SuccessDTO(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    # This will be the return value
    result: Any

    status_code: int