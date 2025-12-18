from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.api.schemas.auth import GymRegisterRequest, LoginRequest, TokenResponse, UserResponse, GymResponse
from app.application.use_cases.register_gym import RegisterGymUseCase
from app.infrastructure.repositories import UserRepository, GymRepository
from app.core.security import create_access_token, verify_password
from app.domain.entities import Gym, User

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=GymResponse)
def register_gym(request: GymRegisterRequest, db: Session = Depends(get_db)):
    gym_repo = GymRepository(db)
    if gym_repo.get_by_email(request.email):
        raise HTTPException(status_code=400, detail="Gym email already registered")
    
    gym_data = Gym(
        name=request.name,
        email=request.email,
        phone=request.phone,
        address=request.address,
        plan_type=request.plan_type,
        is_active=False
    )
    
    admin_data = User(
        gym_id=0, # Placeholder, will be set in use case
        email=request.admin_email,
        hashed_password=request.admin_password, # Use case will hash it
        full_name=request.admin_full_name,
        role='admin',
        is_active=True
    )
    
    use_case = RegisterGymUseCase(db)
    result = use_case.execute(gym_data, admin_data)
    return result["gym"]

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(request.email)
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate JWT
    access_token = create_access_token(
        data={
            "sub": user.email,
            "gym_id": user.gym_id,
            "role": user.role,
            "is_active": user.gym.is_active
        }
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        gym=GymResponse.model_validate(user.gym)
    )
