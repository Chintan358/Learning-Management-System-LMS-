import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)  # admin, instructor, student
    description = Column(String(255), nullable=True)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False,
    )

    # Relationships
    role = relationship("Role", back_populates="users")
    instructor_profile = relationship("InstructorProfile", back_populates="user", uselist=False)
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    batch_mappings = relationship("BatchStudent", back_populates="student", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="student")
    quiz_attempts = relationship("QuizAttempt", back_populates="student")
    attendance_records = relationship("Attendance", foreign_keys="Attendance.student_id", back_populates="student")
    lecture_progress = relationship("LectureProgress", back_populates="student", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="student")
    payments = relationship("Payment", back_populates="student")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class InstructorProfile(Base):
    __tablename__ = "instructors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    qualification = Column(String(255), nullable=True)
    specialization = Column(String(255), nullable=True)
    experience_years = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="instructor_profile")
