from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Any
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from app.infrastructure.database import get_db, MemberModel, UserModel, MembershipPlanModel
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
    
    # Membership distribution by plan names
    distribution = db.query(
        MembershipPlanModel.name, 
        func.count(MemberModel.id)
    ).join(
        MemberModel, MemberModel.plan_id == MembershipPlanModel.id
    ).filter(
        MemberModel.gym_id == gym_id
    ).group_by(MembershipPlanModel.name).all()
    
    membership_distribution = {name: count for name, count in distribution}
    
    # Calculate revenue based on actual plans
    revenue = 0
    for name, count in distribution:
        plan = db.query(MembershipPlanModel).filter(
            MembershipPlanModel.name == name,
            MembershipPlanModel.gym_id == gym_id
        ).first()
        if plan:
            revenue += count * plan.price
        
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
    try:
        gym_id = current_user.gym_id
        
        # Get last 6 months
        now = datetime.now()
        six_months_ago = now - relativedelta(months=5)
        
        # Spanish month names
        month_names = {
            1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun",
            7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"
        }
        
        # Initialize data for last 6 months
        data = []
        for i in range(6):
            month_date = six_months_ago + relativedelta(months=i)
            month_num = month_date.month
            year = month_date.year
            
            # Query members who started in this month with their plans
            members_in_month = db.query(MemberModel).join(
                MembershipPlanModel,
                MemberModel.plan_id == MembershipPlanModel.id,
                isouter=True
            ).filter(
                MemberModel.gym_id == gym_id,
                extract('year', MemberModel.start_date) == year,
                extract('month', MemberModel.start_date) == month_num
            ).all()
            
            # Calculate revenue for this month
            revenue = 0
            for member in members_in_month:
                if member.membership_plan:
                    revenue += member.membership_plan.price
                elif member.membership_type:
                    # Fallback to legacy prices
                    if member.membership_type == 'basic':
                        revenue += 99
                    elif member.membership_type == 'pro':
                        revenue += 269
                    elif member.membership_type == 'elite':
                        revenue += 499
            
            data.append({
                "month": month_names[month_num],
                "revenue": round(revenue, 2)
            })
        
        return data
    except Exception as e:
        print(f"Error in revenue-chart: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating revenue chart: {str(e)}")
