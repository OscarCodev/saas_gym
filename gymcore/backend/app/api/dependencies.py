from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db, UserModel
from app.infrastructure.repositories import UserRepository
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(email)
    if user is None:
        raise credentials_exception
    return user

def verify_active_gym(current_user: UserModel = Depends(get_current_user)) -> bool:
    if not current_user.gym or not current_user.gym.is_active:
        raise HTTPException(
            status_code=403, 
            detail="Suscripción inactiva. Por favor, completa el pago."
        )
    return True

def get_tenant_id(current_user: UserModel = Depends(get_current_user)) -> int:
    return current_user.gym_id
