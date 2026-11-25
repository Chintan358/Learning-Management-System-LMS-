from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class QuizOptionCreate(BaseModel):
    option_text: str
    is_correct: bool = False


class QuizOptionStudentOut(BaseModel):
    id: int
    option_text: str

    model_config = ConfigDict(from_attributes=True)


class QuestionCreate(BaseModel):
    question_text: str
    marks: Optional[int] = 1
    options: List[QuizOptionCreate]


class QuestionStudentOut(BaseModel):
    id: int
    question_text: str
    marks: int
    options: List[QuizOptionStudentOut]

    model_config = ConfigDict(from_attributes=True)


class QuizBase(BaseModel):
    batch_id: int
    title: str
    description: Optional[str] = None
    duration_mins: Optional[int] = 30
    total_marks: Optional[int] = 100
    passing_marks: Optional[int] = 50
    window_start: datetime
    window_end: datetime
    allow_retake: Optional[bool] = False


class QuizCreate(QuizBase):
    questions: List[QuestionCreate] = []


class QuizOut(QuizBase):
    id: int
    created_at: datetime
    questions_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class QuizStartOut(BaseModel):
    attempt_id: int
    quiz_id: int
    title: str
    duration_mins: int
    started_at: datetime
    questions: List[QuestionStudentOut]

    model_config = ConfigDict(from_attributes=True)


class QuizAnswerItem(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None


class QuizSubmitRequest(BaseModel):
    attempt_id: int
    answers: List[QuizAnswerItem]


class QuizResultOut(BaseModel):
    attempt_id: int
    quiz_id: int
    score: Decimal
    total_marks: int
    passing_marks: int
    is_passed: bool
    status: str
    submitted_at: datetime
