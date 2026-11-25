from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.user import User
from app.models.notification import Notification
from app.schemas.certificate import (
    CertificateGenerateRequest,
    CertificateOut,
    VerifyCertificateOut,
)
from app.dependencies.auth import get_current_user, require_role
from app.services.certificate_service import (
    check_certificate_eligibility,
    issue_course_certificate,
)

router = APIRouter(prefix="/certificates", tags=["Certificate Issuance & Verification"])


@router.post("/generate", response_model=CertificateOut, status_code=status.HTTP_201_CREATED)
def generate_certificate(
    req: CertificateGenerateRequest,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == req.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    # Check eligibility rules
    is_eligible, reason, metrics = check_certificate_eligibility(
        db=db,
        student_id=current_user.id,
        course_id=req.course_id,
    )

    if not is_eligible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Certificate issuance criteria not met: {reason}",
        )

    # Issue certificate
    cert = issue_course_certificate(db=db, student_id=current_user.id, course_id=req.course_id)

    # Create congratulatory in-app notification
    notif = Notification(
        user_id=current_user.id,
        title="Certificate Issued!",
        message=f"Congratulations! Your Certificate of Completion for {course.title} is now available for download.",
        type="info",
        action_url="/student/certificates",
    )
    db.add(notif)
    db.commit()

    return cert


@router.get("/my-certificates", response_model=List[CertificateOut])
def get_my_certificates(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    return db.query(Certificate).filter(Certificate.student_id == current_user.id).all()


@router.get("/verify/{code}", response_model=VerifyCertificateOut)
def verify_certificate_public(code: str, db: Session = Depends(get_db)):
    """
    Publicly accessible verification endpoint for certificate codes or certificate numbers.
    """
    clean_code = code.strip()
    cert = db.query(Certificate).filter(
        (Certificate.certificate_number == clean_code)
        | (Certificate.verification_code == clean_code)
    ).first()

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate could not be verified. Invalid verification code or certificate number.",
        )

    student = cert.student
    course = cert.course

    return VerifyCertificateOut(
        is_valid=True,
        certificate_number=cert.certificate_number,
        student_name=f"{student.first_name} {student.last_name}" if student else "Certified Student",
        course_title=course.title if course else "Certified Course",
        issue_date=cert.issue_date,
        verification_code=cert.verification_code,
        pdf_url=cert.pdf_url,
    )
