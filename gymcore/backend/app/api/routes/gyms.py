from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db, UserModel
from app.api.dependencies import get_current_user
from app.api.schemas.gyms import GymUpdateRequest
from app.api.schemas.auth import GymResponse
from app.infrastructure.repositories import GymRepository

router = APIRouter()

@router.put("/me", response_model=GymResponse)
def update_gym_me(
    request: GymUpdateRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify admin role
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update gym details"
        )
    
    gym_repo = GymRepository(db)
    gym = gym_repo.get_by_id(current_user.gym_id)
    
    if not gym:
        raise HTTPException(status_code=404, detail="Gym not found")
        
    # Validate email uniqueness if changed
    if request.email and request.email != gym.email:
        existing_gym = gym_repo.get_by_email(request.email)
        if existing_gym:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gym email already registered"
            )
        gym.email = request.email
    
    if request.name:
        gym.name = request.name
    if request.phone:
        gym.phone = request.phone
    if request.address:
        gym.address = request.address
        
    db.commit()
    db.refresh(gym)
    
    return gym
