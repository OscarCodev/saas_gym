from sqlalchemy.orm import Session
from app.domain.entities import Gym, User
from app.infrastructure.repositories import GymRepository, UserRepository
from app.core.security import get_password_hash

class RegisterGymUseCase:
    def __init__(self, db: Session):
        self.db = db
        self.gym_repo = GymRepository(db)
        self.user_repo = UserRepository(db)

    def execute(self, gym_data: Gym, admin_data: User):
        # Create Gym
        created_gym = self.gym_repo.create(gym_data)
        
        # Create Admin User
        # Ensure password is hashed
        hashed_pwd = get_password_hash(admin_data.hashed_password)
        admin_data.hashed_password = hashed_pwd
        admin_data.gym_id = created_gym.id
        
        created_admin = self.user_repo.create(admin_data)
        
        return {"gym": created_gym, "admin": created_admin}
