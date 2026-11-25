from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserProfileOut


class AssignmentBase(BaseModel):
    batch_id: int
    title: str
    description: str
    attachment_url: Optional[str] = None
    max_marks: Optional[int] = 100
    due_date: datetime


class AssignmentCreate(AssignmentBase):
    pass


class FeedbackOut(BaseModel):
    id: int
    submission_id: int
    evaluated_by: int
    marks_awarded: Decimal
    feedback: Optional[str] = None
    evaluated_at: datetime
    evaluator: Optional[UserProfileOut] = None

    model_config = ConfigDict(from_attributes=True)


class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    file_url: str
    submitted_at: datetime
    is_late: bool
    status: str
    student: Optional[UserProfileOut] = None
    feedback: Optional[FeedbackOut] = None

    model_config = ConfigDict(from_attributes=True)


class AssignmentOut(AssignmentBase):
    id: int
    created_by: int
    created_at: datetime
    creator: Optional[UserProfileOut] = None
    submissions_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class SubmissionCreate(BaseModel):
    file_url: str


class GradeSubmissionRequest(BaseModel):
    marks_awarded: Decimal
    feedback: Optional[str] = None
