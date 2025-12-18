from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.domain.entities import Subscription
from app.infrastructure.repositories import GymRepository, SubscriptionRepository

class ProcessPaymentUseCase:
    def __init__(self, db: Session):
        self.db = db
        self.gym_repo = GymRepository(db)
        self.sub_repo = SubscriptionRepository(db)

    def execute(self, gym_id: int, amount: float, plan_type: str):
        # Update Gym Status
        self.gym_repo.update_status(gym_id, True)
        self.gym_repo.update_plan(gym_id, plan_type)
        
        # Create Subscription
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=30) # Assuming monthly
        
        subscription = Subscription(
            gym_id=gym_id,
            plan_type=plan_type,
            amount=amount,
            status='active',
            start_date=start_date,
            end_date=end_date
        )
        
        return self.sub_repo.create(subscription)
