from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from app.infrastructure.database import get_db, UserModel, GymModel, MemberModel, SubscriptionModel
from app.api.dependencies import get_current_user

router = APIRouter()

def verify_superadmin(current_user: UserModel = Depends(get_current_user)):
    """Verificar que el usuario es superadmin"""
    if current_user.role != 'superadmin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return True

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    is_admin: bool = Depends(verify_superadmin)
):
    """Obtener estadísticas globales del SaaS"""
    
    # Total de gimnasios
    total_gyms = db.query(GymModel).count()
    active_gyms = db.query(GymModel).filter(GymModel.is_active == True).count()
    inactive_gyms = total_gyms - active_gyms
    
    # Total de socios en todos los gimnasios
    total_members = db.query(MemberModel).count()
    active_members = db.query(MemberModel).filter(MemberModel.membership_status == 'active').count()
    
    # Gimnasios registrados este mes
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_gyms_this_month = db.query(GymModel).filter(
        GymModel.created_at >= start_of_month
    ).count()
    
    # Ingresos totales (suma de todas las suscripciones activas)
    total_revenue = db.query(func.sum(SubscriptionModel.amount)).filter(
        SubscriptionModel.status == 'active'
    ).scalar() or 0
    
    return {
        "total_gyms": total_gyms,
        "active_gyms": active_gyms,
        "inactive_gyms": inactive_gyms,
        "total_members": total_members,
        "active_members": active_members,
        "new_gyms_this_month": new_gyms_this_month,
        "total_revenue": float(total_revenue)
    }

@router.get("/gyms")
def get_all_gyms(
    skip: int = 0,
    limit: int = 50,
    status_filter: str = None,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    is_admin: bool = Depends(verify_superadmin)
):
    """Obtener lista de todos los gimnasios"""
    
    query = db.query(GymModel)
    
    # Filtro por estado
    if status_filter == 'active':
        query = query.filter(GymModel.is_active == True)
    elif status_filter == 'inactive':
        query = query.filter(GymModel.is_active == False)
    
    # Búsqueda por nombre o email
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (GymModel.name.ilike(search_filter)) | 
            (GymModel.email.ilike(search_filter))
        )
    
    # Obtener gimnasios con conteo de socios
    gyms = query.offset(skip).limit(limit).all()
    
    result = []
    for gym in gyms:
        member_count = db.query(MemberModel).filter(MemberModel.gym_id == gym.id).count()
        active_member_count = db.query(MemberModel).filter(
            MemberModel.gym_id == gym.id,
            MemberModel.membership_status == 'active'
        ).count()
        
        # Obtener suscripción activa
        subscription = db.query(SubscriptionModel).filter(
            SubscriptionModel.gym_id == gym.id,
            SubscriptionModel.status == 'active'
        ).first()
        
        result.append({
            "id": gym.id,
            "name": gym.name,
            "email": gym.email,
            "phone": gym.phone,
            "address": gym.address,
            "plan_type": gym.plan_type,
            "is_active": gym.is_active,
            "created_at": gym.created_at,
            "member_count": member_count,
            "active_member_count": active_member_count,
            "subscription": {
                "status": subscription.status if subscription else None,
                "plan_type": subscription.plan_type if subscription else None,
                "amount": float(subscription.amount) if subscription else 0,
                "end_date": subscription.end_date if subscription else None
            } if subscription else None
        })
    
    return result

@router.get("/gyms/{gym_id}")
def get_gym_detail(
    gym_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    is_admin: bool = Depends(verify_superadmin)
):
    """Obtener detalles de un gimnasio específico"""
    
    gym = db.query(GymModel).filter(GymModel.id == gym_id).first()
    if not gym:
        raise HTTPException(status_code=404, detail="Gimnasio no encontrado")
    
    # Estadísticas del gimnasio
    member_count = db.query(MemberModel).filter(MemberModel.gym_id == gym_id).count()
    active_members = db.query(MemberModel).filter(
        MemberModel.gym_id == gym_id,
        MemberModel.membership_status == 'active'
    ).count()
    
    # Usuarios del gimnasio
    users = db.query(UserModel).filter(UserModel.gym_id == gym_id).all()
    
    # Suscripción
    subscription = db.query(SubscriptionModel).filter(
        SubscriptionModel.gym_id == gym_id
    ).order_by(SubscriptionModel.created_at.desc()).first()
    
    return {
        "id": gym.id,
        "name": gym.name,
        "email": gym.email,
        "phone": gym.phone,
        "address": gym.address,
        "plan_type": gym.plan_type,
        "is_active": gym.is_active,
        "created_at": gym.created_at,
        "stats": {
            "total_members": member_count,
            "active_members": active_members,
            "user_count": len(users)
        },
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "is_active": u.is_active
            } for u in users
        ],
        "subscription": {
            "status": subscription.status,
            "plan_type": subscription.plan_type,
            "amount": float(subscription.amount),
            "start_date": subscription.start_date,
            "end_date": subscription.end_date
        } if subscription else None
    }

@router.patch("/gyms/{gym_id}/toggle-status")
def toggle_gym_status(
    gym_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    is_admin: bool = Depends(verify_superadmin)
):
    """Activar/desactivar un gimnasio"""
    
    gym = db.query(GymModel).filter(GymModel.id == gym_id).first()
    if not gym:
        raise HTTPException(status_code=404, detail="Gimnasio no encontrado")
    
    gym.is_active = not gym.is_active
    gym.updated_at = datetime.now()
    db.commit()
    db.refresh(gym)
    
    return {
        "id": gym.id,
        "name": gym.name,
        "is_active": gym.is_active,
        "message": f"Gimnasio {'activado' if gym.is_active else 'desactivado'} exitosamente"
    }
