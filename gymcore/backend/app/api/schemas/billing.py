from pydantic import BaseModel
from typing import Optional

class PaymentRequest(BaseModel):
    plan_type: str
    payment_method_mock: str

class PaymentResponse(BaseModel):
    success: bool
    message: str
    subscription_id: Optional[int] = None
    gym_status: str
