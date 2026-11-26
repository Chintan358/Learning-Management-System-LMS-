from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_date = Column(Date, index=True, nullable=False)
    status = Column(String(20), default="present", nullable=False)  # present, absent, excused, late
    remarks = Column(String(500), nullable=True)
    marked_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("batch_id", "student_id", "class_date", name="uq_batch_student_date_attendance"),
    )

    batch = relationship("Batch", back_populates="attendance_records")
    student = relationship("User", foreign_keys=[student_id], back_populates="attendance_records")
    marker = relationship("User", foreign_keys=[marked_by])
