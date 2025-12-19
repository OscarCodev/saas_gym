from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.infrastructure.database import get_db, MemberModel, UserModel
from app.api.dependencies import get_current_user, verify_active_gym
from app.api.schemas.members import MemberCreate, MemberUpdate, MemberResponse

router = APIRouter()

@router.get("/", response_model=List[MemberResponse])
def get_members(
    skip: int = 0,
    limit: int = 10,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    query = db.query(MemberModel).filter(MemberModel.gym_id == current_user.gym_id)
    
    if status and status != 'all':
        query = query.filter(MemberModel.membership_status == status)
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(MemberModel.full_name.ilike(search_filter))
        
    members = query.offset(skip).limit(limit).all()
    return members

@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    member: MemberCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    from app.infrastructure.database import MembershipPlanModel
    
    # Calculate end_date based on plan_id or membership_type
    duration_days = 30  # Default
    
    if member.plan_id:
        # Use custom plan
        plan = db.query(MembershipPlanModel).filter(
            MembershipPlanModel.id == member.plan_id,
            MembershipPlanModel.gym_id == current_user.gym_id
        ).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Membership plan not found")
        duration_days = plan.duration_days
    elif member.membership_type:
        # Legacy: use membership_type
        if member.membership_type == 'pro':
            duration_days = 30
        elif member.membership_type == 'elite':
            duration_days = 30
        
    end_date = member.start_date + timedelta(days=duration_days)
    
    db_member = MemberModel(
        gym_id=current_user.gym_id,
        plan_id=member.plan_id,
        full_name=member.full_name,
        email=member.email,
        phone=member.phone,
        membership_type=member.membership_type,
        membership_status='active',
        start_date=member.start_date,
        end_date=end_date
    )
    
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/{member_id}", response_model=MemberResponse)
def get_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    member = db.query(MemberModel).filter(
        MemberModel.id == member_id,
        MemberModel.gym_id == current_user.gym_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: int,
    member_update: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    db_member = db.query(MemberModel).filter(
        MemberModel.id == member_id,
        MemberModel.gym_id == current_user.gym_id
    ).first()
    
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    update_data = member_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_member, key, value)
        
    db.commit()
    db.refresh(db_member)
    return db_member

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    db_member = db.query(MemberModel).filter(
        MemberModel.id == member_id,
        MemberModel.gym_id == current_user.gym_id
    ).first()
    
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    db.delete(db_member)
    db.commit()
    return None

@router.patch("/{member_id}/suspend", response_model=MemberResponse)
def suspend_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    db_member = db.query(MemberModel).filter(
        MemberModel.id == member_id,
        MemberModel.gym_id == current_user.gym_id
    ).first()
    
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    db_member.membership_status = 'suspended'
    db.commit()
    db.refresh(db_member)
    return db_member

@router.patch("/{member_id}/activate", response_model=MemberResponse)
def activate_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    db_member = db.query(MemberModel).filter(
        MemberModel.id == member_id,
        MemberModel.gym_id == current_user.gym_id
    ).first()
    
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    db_member.membership_status = 'active'
    db.commit()
    db.refresh(db_member)
    return db_member
