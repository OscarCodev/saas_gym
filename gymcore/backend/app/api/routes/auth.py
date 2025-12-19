from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
from app.infrastructure.database import get_db, PasswordResetTokenModel
from app.api.schemas.auth import GymRegisterRequest, LoginRequest, TokenResponse, UserResponse, GymResponse, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.application.use_cases.register_gym import RegisterGymUseCase
from app.infrastructure.repositories import UserRepository, GymRepository
from app.core.security import create_access_token, verify_password, get_password_hash
from app.domain.entities import Gym, User
from app.api.dependencies import get_current_user

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

@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    if request.new_password == request.current_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")
    
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(request.email)
    
    # Always return 200 OK for security
    if not user:
        return {
            "message": "If the email exists, a reset link will be sent",
            "dev_token": None
        }
    
    # Generate token
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    reset_token = PasswordResetTokenModel(
        user_id=user.id,
        token=token,
        expires_at=expires_at,
        used=False
    )
    
    db.add(reset_token)
    db.commit()
    
    return {
        "message": "If the email exists, a reset link will be sent",
        "dev_token": token
    }

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    # Find token
    reset_token = db.query(PasswordResetTokenModel).filter(
        PasswordResetTokenModel.token == request.token,
        PasswordResetTokenModel.used == False,
        PasswordResetTokenModel.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Update user password
    user_repo = UserRepository(db)
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(request.new_password)
    
    # Mark token as used
    reset_token.used = True
    
    db.commit()
    
    return {"message": "Password reset successfully"}
