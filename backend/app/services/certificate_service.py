import io
import uuid
import hashlib
import datetime
from typing import Tuple
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas

from app.models.course import Course, CourseModule, Lecture, LectureProgress
from app.models.batch import Batch, BatchStudent
from app.models.attendance import Attendance
from app.models.quiz import Quiz, QuizAttempt
from app.models.certificate import Certificate
from app.models.user import User
from app.services.cloudinary_service import upload_file_to_cloudinary


def check_certificate_eligibility(db: Session, student_id: int, course_id: int) -> Tuple[bool, str, dict]:
    """
    Validates institutional policy for certification:
    1. Lecture completion >= 80%
    2. Batch attendance >= 75%
    3. All mandatory quizzes passed
    """
    # 1. Lecture Completion
    total_lectures = db.query(Lecture).join(CourseModule).filter(CourseModule.course_id == course_id).count()
    completed_lectures = (
        db.query(LectureProgress)
        .join(Lecture)
        .join(CourseModule)
        .filter(
            CourseModule.course_id == course_id,
            LectureProgress.student_id == student_id,
            LectureProgress.is_completed == True,
        )
        .count()
    )
    lecture_pct = (completed_lectures / total_lectures * 100) if total_lectures > 0 else 0.0

    # 2. Batch Attendance
    batch_map = (
        db.query(BatchStudent)
        .join(Batch)
        .filter(Batch.course_id == course_id, BatchStudent.student_id == student_id)
        .first()
    )
    att_pct = 100.0  # default if no batch yet
    if batch_map:
        total_att = db.query(Attendance).filter(Attendance.batch_id == batch_map.batch_id, Attendance.student_id == student_id).count()
        present_att = (
            db.query(Attendance)
            .filter(
                Attendance.batch_id == batch_map.batch_id,
                Attendance.student_id == student_id,
                Attendance.status == "present",
            )
            .count()
        )
        att_pct = (present_att / total_att * 100) if total_att > 0 else 100.0

    # 3. Quizzes
    quiz_query = db.query(Quiz).join(Batch).filter(Batch.course_id == course_id)
    total_quizzes = quiz_query.count()
    passed_quizzes = 0
    for q in quiz_query.all():
        attempt = (
            db.query(QuizAttempt)
            .filter(
                QuizAttempt.quiz_id == q.id,
                QuizAttempt.student_id == student_id,
                QuizAttempt.is_passed == True,
            )
            .first()
        )
        if attempt:
            passed_quizzes += 1

    quizzes_passed = (passed_quizzes >= total_quizzes) if total_quizzes > 0 else True

    metrics = {
        "lecture_completion_percentage": round(lecture_pct, 1),
        "required_lecture_percentage": 80.0,
        "attendance_percentage": round(att_pct, 1),
        "required_attendance_percentage": 75.0,
        "total_quizzes": total_quizzes,
        "passed_quizzes": passed_quizzes,
    }

    if lecture_pct < 80.0:
        return False, f"Lecture completion is {lecture_pct:.1f}% (required: 80%).", metrics

    if att_pct < 75.0:
        return False, f"Attendance rate is {att_pct:.1f}% (required: 75%).", metrics

    if not quizzes_passed:
        return False, f"You have passed {passed_quizzes} of {total_quizzes} required assessments.", metrics

    return True, "Eligible for certificate issuance.", metrics


def generate_certificate_pdf_bytes(
    student_name: str,
    course_title: str,
    issue_date: str,
    certificate_number: str,
    verification_code: str,
) -> bytes:
    """
    Renders an official landscape PDF completion certificate using ReportLab.
    """
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)  # 792 x 612

    # Background frame & double border
    p.setStrokeColor(colors.HexColor("#4F46E5"))
    p.setLineWidth(6)
    p.rect(20, 20, width - 40, height - 40)

    p.setStrokeColor(colors.HexColor("#A5B4FC"))
    p.setLineWidth(1.5)
    p.rect(26, 26, width - 52, height - 52)

    # Header / Seal
    p.setFillColor(colors.HexColor("#4F46E5"))
    p.setFont("Helvetica-Bold", 14)
    p.drawCentredString(width / 2.0, height - 70, "LEARNING MANAGEMENT SYSTEM")

    p.setFillColor(colors.HexColor("#1E293B"))
    p.setFont("Helvetica-Bold", 32)
    p.drawCentredString(width / 2.0, height - 120, "CERTIFICATE OF COMPLETION")

    p.setFillColor(colors.HexColor("#64748B"))
    p.setFont("Helvetica", 14)
    p.drawCentredString(width / 2.0, height - 160, "This is to officially certify that")

    # Student Name
    p.setFillColor(colors.HexColor("#0F172A"))
    p.setFont("Helvetica-Bold", 26)
    p.drawCentredString(width / 2.0, height - 210, student_name)

    # Line under name
    p.setStrokeColor(colors.HexColor("#CBD5E1"))
    p.setLineWidth(1)
    p.line(width / 2.0 - 180, height - 220, width / 2.0 + 180, height - 220)

    # Course info
    p.setFillColor(colors.HexColor("#64748B"))
    p.setFont("Helvetica", 14)
    p.drawCentredString(width / 2.0, height - 260, "has successfully fulfilled all academic and practical requirements for")

    p.setFillColor(colors.HexColor("#4F46E5"))
    p.setFont("Helvetica-Bold", 20)
    p.drawCentredString(width / 2.0, height - 300, course_title)

    # Date and Signature
    p.setFillColor(colors.HexColor("#334155"))
    p.setFont("Helvetica", 12)
    p.drawString(80, 110, f"Issued Date: {issue_date}")
    p.drawString(80, 90, f"Certificate No: {certificate_number}")

    # Right side: Academic Director Signature Line
    p.setStrokeColor(colors.HexColor("#334155"))
    p.line(width - 260, 120, width - 80, 120)
    p.setFont("Helvetica-Bold", 12)
    p.drawCentredString(width - 170, 102, "Academic Director")
    p.setFont("Helvetica", 10)
    p.drawCentredString(width - 170, 88, "Verified Institutional Credential")

    # Verification Hash footer
    p.setFillColor(colors.HexColor("#94A3B8"))
    p.setFont("Courier", 9)
    p.drawCentredString(width / 2.0, 45, f"Verification Code: {verification_code} | Verify at /verify-certificate/{certificate_number}")

    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer.getvalue()


def issue_course_certificate(db: Session, student_id: int, course_id: int) -> Certificate:
    """
    Generates and commits a certificate for an eligible student.
    """
    student = db.query(User).filter(User.id == student_id).first()
    course = db.query(Course).filter(Course.id == course_id).first()
    if not student or not course:
        raise ValueError("Student or course not found.")

    existing = db.query(Certificate).filter(
        Certificate.student_id == student_id,
        Certificate.course_id == course_id,
    ).first()
    if existing:
        return existing

    today = datetime.date.today()
    random_hex = uuid.uuid4().hex[:6].upper()
    cert_number = f"CERT-{today.year}-{random_hex}"
    raw_hash_data = f"{student_id}:{course_id}:{cert_number}:{today.isoformat()}"
    verification_code = hashlib.sha256(raw_hash_data.encode("utf-8")).hexdigest()

    student_name = f"{student.first_name} {student.last_name}"
    pdf_bytes = generate_certificate_pdf_bytes(
        student_name=student_name,
        course_title=course.title,
        issue_date=today.strftime("%B %d, %Y"),
        certificate_number=cert_number,
        verification_code=verification_code,
    )

    upload_res = upload_file_to_cloudinary(
        file_bytes=pdf_bytes,
        filename=f"{cert_number}.pdf",
        folder="lms_certificates",
        resource_type="raw",
    )

    new_cert = Certificate(
        certificate_number=cert_number,
        student_id=student_id,
        course_id=course_id,
        issue_date=today,
        pdf_url=upload_res["secure_url"],
        verification_code=verification_code,
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return new_cert
