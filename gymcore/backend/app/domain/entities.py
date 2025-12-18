from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class Gym(BaseModel):
    id: Optional[int] = None
    name: str
    email: EmailStr
    phone: str
    address: str
    plan_type: str  # 'basic'|'pro'|'elite'
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(BaseModel):
    id: Optional[int] = None
    gym_id: int
    email: EmailStr
    hashed_password: str
    full_name: str
    role: str  # 'admin'|'staff'
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Member(BaseModel):
    id: Optional[int] = None
    gym_id: int
    full_name: str
    email: EmailStr
    phone: str
    membership_type: str
    membership_status: str  # 'active'|'inactive'|'suspended'
    start_date: datetime
    end_date: datetime
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Subscription(BaseModel):
    id: Optional[int] = None
    gym_id: int
    plan_type: str
    amount: float
    status: str  # 'active'|'cancelled'|'expired'
    start_date: datetime
    end_date: datetime
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
