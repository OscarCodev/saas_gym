from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AttendanceCheckIn(BaseModel):
    dni: str

class AttendanceResponse(BaseModel):
    id: int
    member_id: int
    member_name: str
    member_dni: str
    check_in_time: datetime
    
    class Config:
        from_attributes = True

class AttendanceStats(BaseModel):
    today_count: int
    week_count: int
    month_count: int
