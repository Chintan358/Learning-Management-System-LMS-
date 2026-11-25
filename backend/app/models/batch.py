import datetime
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    schedule_timing = Column(String(100), nullable=True)  # e.g., "Mon-Wed-Fri 10:00 - 12:00"
    capacity = Column(Integer, default=30, nullable=False)
    status = Column(String(20), default="upcoming", nullable=False)  # upcoming, active, completed, cancelled

    course = relationship("Course", back_populates="batches")
    instructor = relationship("User", foreign_keys=[instructor_id])
    batch_students = relationship("BatchStudent", back_populates="batch", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="batch")
    assignments = relationship("Assignment", back_populates="batch")
    quizzes = relationship("Quiz", back_populates="batch")
    attendance_records = relationship("Attendance", back_populates="batch")
    announcements = relationship("Announcement", back_populates="batch")


class BatchStudent(Base):
    __tablename__ = "batch_students"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("batch_id", "student_id", name="uq_batch_student"),
    )

    batch = relationship("Batch", back_populates="batch_students")
    student = relationship("User", back_populates="batch_mappings")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    enrollment_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending, active, completed, cancelled

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", name="uq_student_course_enrollment"),
    )

    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    batch = relationship("Batch", back_populates="enrollments")
