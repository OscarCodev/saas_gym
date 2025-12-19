from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class MemberBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    membership_type: Optional[str] = None  # Legacy field, optional now
    plan_id: Optional[int] = None  # New field for custom plans
    start_date: datetime

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    membership_type: Optional[str] = None
    plan_id: Optional[int] = None
    membership_status: Optional[str] = None

class MemberResponse(MemberBase):
    id: int
    gym_id: int
    plan_id: Optional[int] = None
    membership_status: str
    end_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
