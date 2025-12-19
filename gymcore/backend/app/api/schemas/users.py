from pydantic import BaseModel, EmailStr
from typing import Optional

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
