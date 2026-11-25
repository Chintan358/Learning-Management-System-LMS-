from typing import List, Optional
from datetime import date
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserProfileOut


class StudentAttendanceItem(BaseModel):
    student_id: int
    status: str  # present, absent, excused


class MarkAttendanceRequest(BaseModel):
    batch_id: int
    class_date: date
    records: List[StudentAttendanceItem]


class AttendanceRecordOut(BaseModel):
    id: int
    batch_id: int
    student_id: int
    class_date: date
    status: str
    marked_by: int
    student: Optional[UserProfileOut] = None

    model_config = ConfigDict(from_attributes=True)


class AttendanceSummaryOut(BaseModel):
    student_id: int
    total_classes: int
    present_classes: int
    absent_classes: int
    attendance_percentage: float
