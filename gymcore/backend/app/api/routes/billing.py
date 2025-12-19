from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from app.infrastructure.database import get_db, UserModel, PaymentMethodModel
from app.api.dependencies import get_current_user, verify_active_gym
from app.api.schemas.billing import PaymentRequest, PaymentResponse, ChangePlanRequest, InvoiceResponse, UpdatePaymentMethodRequest
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
    # Let's assign dummy amounts in soles (PEN).
    amounts = {"basic": 99.00, "pro": 269.00, "elite": 499.00}
    amount = amounts.get(request.plan_type, 99.00)
    
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

@router.post("/cancel-subscription")
def cancel_subscription(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admin can cancel subscription")
    
    sub_repo = SubscriptionRepository(db)
    subscription = sub_repo.get_active_by_gym(current_user.gym_id)
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    subscription.status = 'cancelled'
    subscription.cancelled_at = datetime.now()
    db.commit()
    
    return {
        "message": "Subscription cancelled successfully",
        "access_until": subscription.end_date
    }

@router.post("/change-plan")
def change_plan(
    request: ChangePlanRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Obtener el usuario actual y verificar que sea admin.
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admin can change plan")
    
    gym = current_user.gym
    
    # 2. Validar que "new_plan" sea diferente al plan actual
    if request.new_plan == gym.plan_type:
        raise HTTPException(status_code=400, detail="New plan must be different from current plan")
    
    # Check for active subscription
    sub_repo = SubscriptionRepository(db)
    active_sub = sub_repo.get_active_by_gym(gym.id)
    
    if not active_sub:
        raise HTTPException(status_code=404, detail="No active subscription found")

    # 3. Calcular el prorrateado (Simulated logic)
    # Define plan hierarchy for upgrade/downgrade check
    plans = ["basic", "pro", "elite"]
    current_plan_idx = plans.index(gym.plan_type) if gym.plan_type in plans else -1
    new_plan_idx = plans.index(request.new_plan)
    
    # 4. Actualizar "gym.plan_type" en la base de datos.
    gym.plan_type = request.new_plan
    active_sub.plan_type = request.new_plan # Keep subscription in sync
    
    db.commit()
    
    # 6. Retornar confirmacion del cambio.
    return {
        "message": "Plan changed successfully",
        "new_plan": request.new_plan,
        "effective_date": datetime.now(),
        "next_billing_date": active_sub.end_date
    }

@router.get("/invoices", response_model=List[InvoiceResponse])
def get_invoices(
    current_user: UserModel = Depends(get_current_user),
    authorized: bool = Depends(verify_active_gym),
    db: Session = Depends(get_db)
):
    sub_repo = SubscriptionRepository(db)
    subscriptions = sub_repo.get_all_by_gym(current_user.gym_id)
    
    invoices = []
    for sub in subscriptions:
        invoices.append(InvoiceResponse(
            id=sub.id,
            date=sub.start_date,
            amount=sub.amount,
            plan=sub.plan_type,
            status=sub.status
        ))
    
    return invoices

@router.put("/payment-method")
def update_payment_method(
    request: UpdatePaymentMethodRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Only admin can update payment method")
    
    # 2. Validar que la tarjeta no este expirada.
    now = datetime.now()
    if request.expiry_year < now.year or (request.expiry_year == now.year and request.expiry_month < now.month):
         raise HTTPException(status_code=400, detail="Card has expired")

    # Deactivate previous methods
    db.query(PaymentMethodModel).filter(
        PaymentMethodModel.gym_id == current_user.gym_id,
        PaymentMethodModel.is_active == True
    ).update({"is_active": False})
    
    # Create new method
    card_type = "Visa" if request.card_number.startswith("4") else "MasterCard"
    
    new_method = PaymentMethodModel(
        gym_id=current_user.gym_id,
        last_four=request.card_number[-4:],
        card_type=card_type,
        expiry_month=request.expiry_month,
        expiry_year=request.expiry_year,
        is_active=True
    )
    
    db.add(new_method)
    db.commit()
    
    return {
        "message": "Payment method updated successfully",
        "last_four": new_method.last_four,
        "card_type": new_method.card_type
    }
