from pydantic import BaseModel, Field
from typing import Optional

class PaymentRequest(BaseModel):
    plan_type: str
    payment_method_mock: str

class PaymentResponse(BaseModel):
    success: bool
    message: str
    subscription_id: Optional[int] = None
    gym_status: str

class ChangePlanRequest(BaseModel):
    new_plan: str = Field(pattern='^(basic|pro|elite)$')

from typing import List
from datetime import datetime

class InvoiceResponse(BaseModel):
    id: int
    date: datetime
    amount: float
    plan: str
    status: str

    class Config:
        from_attributes = True

class UpdatePaymentMethodRequest(BaseModel):
    card_number: str = Field(min_length=16, max_length=16)
    expiry_month: int = Field(ge=1, le=12)
    expiry_year: int = Field(ge=2025)
    cvv: str = Field(min_length=3, max_length=4)
