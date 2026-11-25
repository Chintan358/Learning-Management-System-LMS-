import datetime
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_number = Column(String(100), unique=True, index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    issue_date = Column(Date, default=datetime.date.today, nullable=False)
    pdf_url = Column(String(500), nullable=True)  # Cloudinary hosted certificate PDF
    verification_code = Column(String(64), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", name="uq_student_course_certificate"),
    )

    student = relationship("User", back_populates="certificates")
    course = relationship("Course", back_populates="certificates")
