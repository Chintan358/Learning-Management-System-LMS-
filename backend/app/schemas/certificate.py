from typing import Optional
from datetime import date
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserProfileOut


class CertificateGenerateRequest(BaseModel):
    course_id: int


class CertificateOut(BaseModel):
    id: int
    certificate_number: str
    student_id: int
    course_id: int
    issue_date: date
    pdf_url: Optional[str] = None
    verification_code: str
    student: Optional[UserProfileOut] = None

    model_config = ConfigDict(from_attributes=True)


class VerifyCertificateOut(BaseModel):
    is_valid: bool
    certificate_number: str
    student_name: str
    course_title: str
    issue_date: date
    verification_code: str
    pdf_url: Optional[str] = None
