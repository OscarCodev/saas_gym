from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class GymResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    plan_type: str
    is_active: bool

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    gym_id: int

    class Config:
        from_attributes = True

class GymRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    admin_email: EmailStr
    admin_password: str = Field(min_length=8)
    admin_full_name: str
    plan_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    gym: GymResponse
