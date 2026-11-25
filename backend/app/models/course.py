import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), index=True, nullable=False)
    duration_weeks = Column(Integer, default=4, nullable=False)
    fee = Column(Numeric(10, 2), default=0.00, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    status = Column(String(20), default="draft", nullable=False)  # draft, published, archived
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False,
    )

    modules = relationship("CourseModule", back_populates="course", cascade="all, delete-orphan", order_by="CourseModule.order_index")
    batches = relationship("Batch", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")
    certificates = relationship("Certificate", back_populates="course")
    payments = relationship("Payment", back_populates="course")


class CourseModule(Base):
    __tablename__ = "course_modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=1, nullable=False)

    course = relationship("Course", back_populates="modules")
    lectures = relationship("Lecture", back_populates="module", cascade="all, delete-orphan", order_by="Lecture.sequence")


class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("course_modules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=True)
    duration_mins = Column(Integer, default=0, nullable=False)
    sequence = Column(Integer, default=1, nullable=False)

    module = relationship("CourseModule", back_populates="lectures")
    materials = relationship("StudyMaterial", back_populates="lecture", cascade="all, delete-orphan")
    progress_records = relationship("LectureProgress", back_populates="lecture", cascade="all, delete-orphan")


class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    lecture_id = Column(Integer, ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, pptx, zip, etc.
    file_size_kb = Column(Integer, nullable=True)

    lecture = relationship("Lecture", back_populates="materials")


class LectureProgress(Base):
    __tablename__ = "lecture_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lecture_id = Column(Integer, ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False)
    is_completed = Column(Boolean, default=True, nullable=False)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("student_id", "lecture_id", name="uq_student_lecture_progress"),
    )

    student = relationship("User", back_populates="lecture_progress")
    lecture = relationship("Lecture", back_populates="progress_records")
