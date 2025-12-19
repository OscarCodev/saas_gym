from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from app.infrastructure.database import get_db, NotificationModel, UserModel
from app.api.dependencies import get_current_user

router = APIRouter()

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get unread notifications
    unread = db.query(NotificationModel).filter(
        NotificationModel.gym_id == current_user.gym_id,
        NotificationModel.is_read == False
    ).order_by(NotificationModel.created_at.desc()).limit(10).all()
    
    # Get recent read notifications
    read = db.query(NotificationModel).filter(
        NotificationModel.gym_id == current_user.gym_id,
        NotificationModel.is_read == True
    ).order_by(NotificationModel.created_at.desc()).limit(5).all()
    
    return unread + read

@router.post("/{id}/mark-read")
def mark_notification_read(
    id: int,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(NotificationModel).filter(
        NotificationModel.id == id,
        NotificationModel.gym_id == current_user.gym_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}
