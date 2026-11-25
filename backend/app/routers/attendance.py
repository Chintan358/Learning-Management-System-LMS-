from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.attendance import Attendance
from app.models.batch import Batch, BatchStudent
from app.models.user import User
from app.schemas.attendance import (
    MarkAttendanceRequest,
    AttendanceRecordOut,
    AttendanceSummaryOut,
)
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/attendance", tags=["Attendance Management"])


@router.post("", status_code=status.HTTP_200_OK)
def mark_attendance(
    attendance_data: MarkAttendanceRequest,
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == attendance_data.batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    if current_user.role.name == "instructor" and batch.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to mark attendance for unassigned batch.")

    saved_count = 0
    for item in attendance_data.records:
        # Check if record already exists for this batch, student, and date
        existing = db.query(Attendance).filter(
            Attendance.batch_id == attendance_data.batch_id,
            Attendance.student_id == item.student_id,
            Attendance.class_date == attendance_data.class_date,
        ).first()

        if existing:
            existing.status = item.status
            existing.marked_by = current_user.id
        else:
            rec = Attendance(
                batch_id=attendance_data.batch_id,
                student_id=item.student_id,
                class_date=attendance_data.class_date,
                status=item.status,
                marked_by=current_user.id,
            )
            db.add(rec)
        saved_count += 1

    db.commit()
    return {
        "message": f"Successfully recorded attendance for {saved_count} student(s).",
        "batch_id": attendance_data.batch_id,
        "class_date": attendance_data.class_date,
    }


@router.get("/batch/{batch_id}", response_model=List[AttendanceRecordOut])
def get_batch_attendance(
    batch_id: int,
    class_date: Optional[date] = None,
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance).filter(Attendance.batch_id == batch_id)
    if class_date:
        query = query.filter(Attendance.class_date == class_date)
    return query.order_by(Attendance.class_date.desc()).all()


@router.get("/my-summary", response_model=AttendanceSummaryOut)
def get_my_attendance_summary(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    total = db.query(Attendance).filter(Attendance.student_id == current_user.id).count()
    present = db.query(Attendance).filter(
        Attendance.student_id == current_user.id,
        Attendance.status == "present",
    ).count()
    absent = db.query(Attendance).filter(
        Attendance.student_id == current_user.id,
        Attendance.status == "absent",
    ).count()

    percentage = round((present / total * 100), 1) if total > 0 else 0.0

    return AttendanceSummaryOut(
        student_id=current_user.id,
        total_classes=total,
        present_classes=present,
        absent_classes=absent,
        attendance_percentage=percentage,
    )
