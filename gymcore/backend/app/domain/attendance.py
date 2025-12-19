from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Attendance(BaseModel):
    id: Optional[int] = None
    member_id: int
    gym_id: int
    check_in_time: datetime
    created_at: Optional[datetime] = None
