from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.infrastructure.database import get_db, UserModel
from app.api.dependencies import get_current_user, verify_active_gym
from app.api.schemas.billing import PaymentRequest, PaymentResponse
from app.application.use_cases.process_payment import ProcessPaymentUseCase
from app.infrastructure.repositories import SubscriptionRepository
from app.domain.entities import Subscription

router = APIRouter()

@router.post("/mock-payment", response_model=PaymentResponse)
def mock_payment(
    request: PaymentRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate gym is not already active (idempotency check)
    if current_user.gym.is_active:
        return PaymentResponse(
            success=True,
            message="Gym is already active",
            gym_status="active"
        )
    
    # Process Payment
    # In a real scenario, we would verify payment_method_mock here
    
    use_case = ProcessPaymentUseCase(db)
    # Assuming amount is fixed based on plan_type for now, or passed in request. 
    # The prompt schema for PaymentRequest only has plan_type and payment_method_mock.
    # Let's assign dummy amounts.
    amounts = {"basic": 29.99, "pro": 59.99, "elite": 99.99}
    amount = amounts.get(request.plan_type, 29.99)
    
    subscription = use_case.execute(current_user.gym_id, amount, request.plan_type)
    
    return PaymentResponse(
        success=True,
        message="Payment successful",
        subscription_id=subscription.id,
        gym_status="active"
    )

@router.get("/subscription")
def get_subscription(
    current_user: UserModel = Depends(get_current_user),
    authorized: bool = Depends(verify_active_gym),
    db: Session = Depends(get_db)
):
    sub_repo = SubscriptionRepository(db)
    subscription = sub_repo.get_active_by_gym(current_user.gym_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    return subscription
