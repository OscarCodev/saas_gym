from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.infrastructure.database import get_db, MemberModel, AttendanceModel, UserModel
from app.api.dependencies import get_current_user, verify_active_gym
from app.api.schemas.attendance import AttendanceCheckIn, AttendanceResponse, AttendanceStats
from app.infrastructure.repositories import AttendanceRepository

router = APIRouter()

@router.post("/check-in", response_model=AttendanceResponse)
def check_in_member(
    check_in: AttendanceCheckIn,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Registrar asistencia de un socio por DNI"""
    # Buscar socio por DNI
    member = db.query(MemberModel).filter(
        MemberModel.dni == check_in.dni,
        MemberModel.gym_id == current_user.gym_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró ningún socio con DNI {check_in.dni}"
        )
    
    # Verificar si está activo
    if member.membership_status != 'active':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El socio {member.full_name} no tiene membresía activa"
        )
    
    # Verificar si la membresía está vigente
    if member.end_date < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La membresía de {member.full_name} ha expirado"
        )
    
    # Registrar asistencia
    attendance_repo = AttendanceRepository(db)
    attendance = attendance_repo.check_in(member.id, current_user.gym_id)
    
    return AttendanceResponse(
        id=attendance.id,
        member_id=attendance.member_id,
        member_name=member.full_name,
        member_dni=member.dni,
        check_in_time=attendance.check_in_time
    )

@router.get("/today", response_model=List[AttendanceResponse])
def get_today_attendances(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Obtener todas las asistencias de hoy"""
    attendance_repo = AttendanceRepository(db)
    attendances = attendance_repo.get_today_by_gym(current_user.gym_id)
    
    return [
        AttendanceResponse(
            id=att.id,
            member_id=att.member_id,
            member_name=att.member.full_name,
            member_dni=att.member.dni,
            check_in_time=att.check_in_time
        )
        for att in attendances
    ]

@router.get("/member/{member_id}", response_model=List[AttendanceResponse])
def get_member_attendances(
    member_id: int,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Obtener historial de asistencias de un socio"""
    # Verificar que el socio pertenece al gym del usuario
    member = db.query(MemberModel).filter(
        MemberModel.id == member_id,
        MemberModel.gym_id == current_user.gym_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    
    attendance_repo = AttendanceRepository(db)
    attendances = attendance_repo.get_by_member(member_id, limit)
    
    return [
        AttendanceResponse(
            id=att.id,
            member_id=att.member_id,
            member_name=att.member.full_name,
            member_dni=att.member.dni,
            check_in_time=att.check_in_time
        )
        for att in attendances
    ]

@router.get("/stats", response_model=AttendanceStats)
def get_attendance_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Obtener estadísticas de asistencias"""
    attendance_repo = AttendanceRepository(db)
    stats = attendance_repo.get_stats(current_user.gym_id)
    
    return AttendanceStats(**stats)

@router.get("/range", response_model=List[AttendanceResponse])
def get_attendances_by_range(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    active: bool = Depends(verify_active_gym)
):
    """Obtener asistencias de los últimos N días"""
    from datetime import timedelta
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    attendances = db.query(AttendanceModel).join(
        MemberModel, AttendanceModel.member_id == MemberModel.id
    ).filter(
        MemberModel.gym_id == current_user.gym_id,
        AttendanceModel.check_in_time >= start_date,
        AttendanceModel.check_in_time <= end_date
    ).order_by(AttendanceModel.check_in_time.desc()).all()
    
    return [
        AttendanceResponse(
            id=att.id,
            member_id=att.member_id,
            member_name=att.member.full_name,
            member_dni=att.member.dni,
            check_in_time=att.check_in_time
        )
        for att in attendances
    ]
