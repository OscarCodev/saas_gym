from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MembershipPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_days: int
    benefits: Optional[str] = None  # JSON string with benefits list

class MembershipPlanCreate(MembershipPlanBase):
    pass

class MembershipPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    benefits: Optional[str] = None
    is_active: Optional[bool] = None

class MembershipPlanResponse(MembershipPlanBase):
    id: int
    gym_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
