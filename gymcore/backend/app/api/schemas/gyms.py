from pydantic import BaseModel, EmailStr
from typing import Optional

class GymUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
