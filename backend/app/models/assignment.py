import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from app.database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    attachment_url = Column(String(500), nullable=True)  # Cloudinary brief/starter
    max_marks = Column(Integer, default=100, nullable=False)
    due_date = Column(DateTime, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    batch = relationship("Batch", back_populates="assignments")
    creator = relationship("User", foreign_keys=[created_by])
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String(500), nullable=False)  # Cloudinary submission file
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    is_late = Column(Boolean, default=False, nullable=False)
    status = Column(String(20), default="submitted", nullable=False)  # submitted, late, evaluated

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    feedback = relationship("AssignmentFeedback", back_populates="submission", uselist=False, cascade="all, delete-orphan")


class AssignmentFeedback(Base):
    __tablename__ = "assignment_feedback"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    evaluated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    marks_awarded = Column(Numeric(5, 2), nullable=False)
    feedback = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    submission = relationship("Submission", back_populates="feedback")
    evaluator = relationship("User", foreign_keys=[evaluated_by])
