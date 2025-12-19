from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db, UserModel
from app.api.dependencies import get_current_user
from app.api.schemas.users import UserUpdateRequest
from app.api.schemas.auth import UserResponse
from app.infrastructure.repositories import UserRepository

router = APIRouter()

@router.put("/me", response_model=UserResponse)
def update_user_me(
    request: UserUpdateRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    
    # Validate email uniqueness if changed
    if request.email and request.email != current_user.email:
        existing_user = user_repo.get_by_email(request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = request.email
    
    if request.full_name:
        current_user.full_name = request.full_name
    
    db.commit()
    db.refresh(current_user)
    
    return current_user
