from sqlalchemy.orm import Session
from app.infrastructure.repositories import MemberRepository, SubscriptionRepository

class GetDashboardStatsUseCase:
    def __init__(self, db: Session):
        self.member_repo = MemberRepository(db)
        self.sub_repo = SubscriptionRepository(db)

    def execute(self, gym_id: int):
        member_count = self.member_repo.count_by_gym(gym_id)
        active_subscription = self.sub_repo.get_active_by_gym(gym_id)
        
        return {
            "total_members": member_count,
            "subscription_status": active_subscription.status if active_subscription else "inactive",
            "plan_type": active_subscription.plan_type if active_subscription else "none"
        }
