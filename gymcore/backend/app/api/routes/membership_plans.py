from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.infrastructure.database import get_db, UserModel
from app.api.dependencies import get_current_user, verify_active_gym
from app.api.schemas.membership_plans import (
    MembershipPlanCreate,
    MembershipPlanUpdate,
    MembershipPlanResponse
)
from app.infrastructure.repositories import MembershipPlanRepository
from app.domain.entities import MembershipPlan

router = APIRouter()

@router.get("/", response_model=List[MembershipPlanResponse])
def get_membership_plans(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Get all membership plans for the current gym"""
    repo = MembershipPlanRepository(db)
    plans = repo.get_all_by_gym(current_user.gym_id, include_inactive=include_inactive)
    return plans

@router.post("/", response_model=MembershipPlanResponse, status_code=status.HTTP_201_CREATED)
def create_membership_plan(
    plan: MembershipPlanCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Create a new membership plan for the gym"""
    # Only admins can create plans
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create membership plans"
        )
    
    repo = MembershipPlanRepository(db)
    plan_entity = MembershipPlan(
        gym_id=current_user.gym_id,
        name=plan.name,
        description=plan.description,
        price=plan.price,
        duration_days=plan.duration_days,
        benefits=plan.benefits,
        is_active=True
    )
    
    db_plan = repo.create(plan_entity)
    return db_plan

@router.get("/{plan_id}", response_model=MembershipPlanResponse)
def get_membership_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Get a specific membership plan"""
    repo = MembershipPlanRepository(db)
    plan = repo.get_by_id(plan_id, current_user.gym_id)
    
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    return plan

@router.put("/{plan_id}", response_model=MembershipPlanResponse)
def update_membership_plan(
    plan_id: int,
    plan_update: MembershipPlanUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Update a membership plan"""
    # Only admins can update plans
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update membership plans"
        )
    
    repo = MembershipPlanRepository(db)
    update_data = plan_update.dict(exclude_unset=True)
    
    updated_plan = repo.update(plan_id, current_user.gym_id, update_data)
    
    if not updated_plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    return updated_plan

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_membership_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Delete a membership plan"""
    # Only admins can delete plans
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete membership plans"
        )
    
    repo = MembershipPlanRepository(db)
    success = repo.delete(plan_id, current_user.gym_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    return None

@router.patch("/{plan_id}/toggle-status", response_model=MembershipPlanResponse)
def toggle_plan_status(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Toggle the active status of a membership plan"""
    # Only admins can toggle status
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can toggle plan status"
        )
    
    repo = MembershipPlanRepository(db)
    plan = repo.toggle_status(plan_id, current_user.gym_id)
    
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    
    return plan
