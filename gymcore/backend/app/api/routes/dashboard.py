from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.infrastructure.database import get_db, MemberModel, UserModel
from app.api.dependencies import get_current_user, verify_active_gym
from app.api.schemas.members import MemberResponse

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    gym_id = current_user.gym_id
    
    # Member counts
    total_members = db.query(MemberModel).filter(MemberModel.gym_id == gym_id).count()
    active_members = db.query(MemberModel).filter(
        MemberModel.gym_id == gym_id, 
        MemberModel.membership_status == 'active'
    ).count()
    inactive_members = db.query(MemberModel).filter(
        MemberModel.gym_id == gym_id, 
        MemberModel.membership_status == 'inactive'
    ).count()
    
    # New members this month
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_members = db.query(MemberModel).filter(
        MemberModel.gym_id == gym_id,
        MemberModel.created_at >= start_of_month
    ).count()
    
    # Membership distribution
    distribution = db.query(
        MemberModel.membership_type, 
        func.count(MemberModel.id)
    ).filter(
        MemberModel.gym_id == gym_id
    ).group_by(MemberModel.membership_type).all()
    
    membership_distribution = {type_: count for type_, count in distribution}
    
    # Mock revenue calculation
    revenue = 0
    for type_, count in membership_distribution.items():
        if type_ == 'basic': revenue += count * 29
        elif type_ == 'pro': revenue += count * 49
        elif type_ == 'elite': revenue += count * 99
        
    return {
        "total_members": total_members,
        "active_members": active_members,
        "inactive_members": inactive_members,
        "revenue_this_month": revenue,
        "new_members_this_month": new_members,
        "membership_distribution": membership_distribution
    }

@router.get("/recent-activity", response_model=List[MemberResponse])
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    recent_members = db.query(MemberModel).filter(
        MemberModel.gym_id == current_user.gym_id
    ).order_by(MemberModel.created_at.desc()).limit(10).all()
    
    return recent_members

@router.get("/revenue-chart")
def get_revenue_chart(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    # Mock data for the last 6 months
    months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
    data = []
    
    # Base revenue
    base = 1000
    
    for i, month in enumerate(months):
        # Add some randomness/growth
        revenue = base + (i * 150) + (50 if i % 2 == 0 else -50)
        data.append({"month": month, "revenue": revenue})
        
    return data
