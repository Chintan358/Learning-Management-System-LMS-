from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserProfileOut


class BatchStudentOut(BaseModel):
    id: int
    batch_id: int
    student_id: int
    joined_at: datetime
    student: UserProfileOut

    model_config = ConfigDict(from_attributes=True)


class BatchBase(BaseModel):
    batch_code: str
    name: str
    course_id: int
    instructor_id: Optional[int] = None
    start_date: date
    end_date: date
    schedule_timing: Optional[str] = None
    capacity: Optional[int] = 30
    status: Optional[str] = "upcoming"


class BatchCreate(BatchBase):
    pass


class BatchUpdate(BaseModel):
    batch_code: Optional[str] = None
    name: Optional[str] = None
    course_id: Optional[int] = None
    instructor_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    schedule_timing: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None


class BatchOut(BatchBase):
    id: int
    enrolled_count: Optional[int] = 0
    instructor: Optional[UserProfileOut] = None

    model_config = ConfigDict(from_attributes=True)


class BatchDetailOut(BatchOut):
    batch_students: List[BatchStudentOut] = []

    model_config = ConfigDict(from_attributes=True)


class EnrollmentRequest(BaseModel):
    student_id: int
