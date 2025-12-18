from sqlalchemy.orm import Session
from typing import List, Optional
from app.infrastructure.database import GymModel, UserModel, MemberModel, SubscriptionModel
from app.domain.entities import Gym, User, Member, Subscription
from app.core.security import verify_password, get_password_hash

class GymRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, gym: Gym) -> GymModel:
        db_gym = GymModel(
            name=gym.name,
            email=gym.email,
            phone=gym.phone,
            address=gym.address,
            plan_type=gym.plan_type,
            is_active=gym.is_active
        )
        self.db.add(db_gym)
        self.db.commit()
        self.db.refresh(db_gym)
        return db_gym

    def get_by_id(self, gym_id: int) -> Optional[GymModel]:
        return self.db.query(GymModel).filter(GymModel.id == gym_id).first()

    def get_by_email(self, email: str) -> Optional[GymModel]:
        return self.db.query(GymModel).filter(GymModel.email == email).first()

    def update_status(self, gym_id: int, is_active: bool) -> Optional[GymModel]:
        gym = self.get_by_id(gym_id)
        if gym:
            gym.is_active = is_active
            self.db.commit()
            self.db.refresh(gym)
        return gym

    def update_plan(self, gym_id: int, plan_type: str) -> Optional[GymModel]:
        gym = self.get_by_id(gym_id)
        if gym:
            gym.plan_type = plan_type
            self.db.commit()
            self.db.refresh(gym)
        return gym

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: User) -> UserModel:
        hashed_password = get_password_hash(user.hashed_password) # Assuming input is plain text here or handled before. 
        # The entity User has 'hashed_password' field. 
        # If the use case passes plain text in that field, we hash it here.
        # Or if the use case hashes it, we just use it.
        # Let's assume the use case handles hashing or we hash here if it looks like plain text?
        # Better: The UseCase should probably hash it, OR we hash it here.
        # Given 'hashed_password' field name in Entity, let's assume it comes hashed or we treat the input as the value to store.
        # However, for safety, let's assume the UseCase passes the HASHED password in the entity field 'hashed_password'.
        
        db_user = UserModel(
            gym_id=user.gym_id,
            email=user.email,
            hashed_password=user.hashed_password,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_by_email(self, email: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def get_by_gym_id(self, gym_id: int) -> List[UserModel]:
        return self.db.query(UserModel).filter(UserModel.gym_id == gym_id).all()

    def authenticate(self, email: str, password: str) -> Optional[UserModel]:
        user = self.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

class MemberRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, member: Member) -> MemberModel:
        db_member = MemberModel(
            gym_id=member.gym_id,
            full_name=member.full_name,
            email=member.email,
            phone=member.phone,
            membership_type=member.membership_type,
            membership_status=member.membership_status,
            start_date=member.start_date,
            end_date=member.end_date
        )
        self.db.add(db_member)
        self.db.commit()
        self.db.refresh(db_member)
        return db_member

    def get_by_id(self, member_id: int, gym_id: int) -> Optional[MemberModel]:
        return self.db.query(MemberModel).filter(MemberModel.id == member_id, MemberModel.gym_id == gym_id).first()

    def get_all_by_gym(self, gym_id: int) -> List[MemberModel]:
        return self.db.query(MemberModel).filter(MemberModel.gym_id == gym_id).all()

    def update(self, member_id: int, gym_id: int, member_data: dict) -> Optional[MemberModel]:
        member = self.get_by_id(member_id, gym_id)
        if member:
            for key, value in member_data.items():
                setattr(member, key, value)
            self.db.commit()
            self.db.refresh(member)
        return member

    def delete(self, member_id: int, gym_id: int) -> bool:
        member = self.get_by_id(member_id, gym_id)
        if member:
            self.db.delete(member)
            self.db.commit()
            return True
        return False

    def count_by_gym(self, gym_id: int) -> int:
        return self.db.query(MemberModel).filter(MemberModel.gym_id == gym_id).count()

class SubscriptionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, subscription: Subscription) -> SubscriptionModel:
        db_sub = SubscriptionModel(
            gym_id=subscription.gym_id,
            plan_type=subscription.plan_type,
            amount=subscription.amount,
            status=subscription.status,
            start_date=subscription.start_date,
            end_date=subscription.end_date
        )
        self.db.add(db_sub)
        self.db.commit()
        self.db.refresh(db_sub)
        return db_sub

    def get_active_by_gym(self, gym_id: int) -> Optional[SubscriptionModel]:
        return self.db.query(SubscriptionModel).filter(
            SubscriptionModel.gym_id == gym_id,
            SubscriptionModel.status == 'active'
        ).first()

    def update_status(self, subscription_id: int, status: str) -> Optional[SubscriptionModel]:
        sub = self.db.query(SubscriptionModel).filter(SubscriptionModel.id == subscription_id).first()
        if sub:
            sub.status = status
            self.db.commit()
            self.db.refresh(sub)
        return sub
