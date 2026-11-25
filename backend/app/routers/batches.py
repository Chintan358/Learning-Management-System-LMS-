from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.batch import Batch, BatchStudent, Enrollment
from app.models.course import Course
from app.models.user import User
from app.schemas.batch import BatchOut, BatchDetailOut, BatchCreate, BatchUpdate, EnrollmentRequest
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/batches", tags=["Batch & Cohort Management"])


@router.get("", response_model=List[BatchOut])
def list_batches(
    course_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Batch)

    # Role-based filtering
    if current_user.role.name == "instructor":
        query = query.filter(Batch.instructor_id == current_user.id)
    elif current_user.role.name == "student":
        # Students only see batches they are enrolled in
        enrolled_batch_ids = [bs.batch_id for bs in db.query(BatchStudent.batch_id).filter(BatchStudent.student_id == current_user.id).all()]
        query = query.filter(Batch.id.in_(enrolled_batch_ids))

    if course_id:
        query = query.filter(Batch.course_id == course_id)
    if status_filter:
        query = query.filter(Batch.status == status_filter)

    batches = query.all()

    # Populate enrolled_count dynamically
    result = []
    for b in batches:
        b_dict = BatchOut.model_validate(b)
        b_dict.enrolled_count = len(b.batch_students)
        result.append(b_dict)

    return result


@router.post("", response_model=BatchOut, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch_data: BatchCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    existing = db.query(Batch).filter(Batch.batch_code == batch_data.batch_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Batch code '{batch_data.batch_code}' already exists.",
        )

    # Validate course exists
    course = db.query(Course).filter(Course.id == batch_data.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target course not found.")

    # Validate dates
    if batch_data.end_date <= batch_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Batch end date must be after the start date.",
        )

    new_batch = Batch(
        batch_code=batch_data.batch_code,
        name=batch_data.name,
        course_id=batch_data.course_id,
        instructor_id=batch_data.instructor_id,
        start_date=batch_data.start_date,
        end_date=batch_data.end_date,
        schedule_timing=batch_data.schedule_timing,
        capacity=batch_data.capacity or 30,
        status=batch_data.status or "upcoming",
    )
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)

    out = BatchOut.model_validate(new_batch)
    out.enrolled_count = 0
    return out


@router.get("/{batch_id}", response_model=BatchDetailOut)
def get_batch_detail(
    batch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    # Permission check: instructor can only view their own batches, student only enrolled
    if current_user.role.name == "instructor" and batch.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to unassigned batch.")
    if current_user.role.name == "student":
        is_enrolled = db.query(BatchStudent).filter(
            BatchStudent.batch_id == batch_id,
            BatchStudent.student_id == current_user.id,
        ).first()
        if not is_enrolled:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Not enrolled in this batch.")

    out = BatchDetailOut.model_validate(batch)
    out.enrolled_count = len(batch.batch_students)
    return out


@router.put("/{batch_id}", response_model=BatchOut)
def update_batch(
    batch_id: int,
    update_data: BatchUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    data_dict = update_data.model_dump(exclude_unset=True)
    for field, val in data_dict.items():
        setattr(batch, field, val)

    db.commit()
    db.refresh(batch)
    out = BatchOut.model_validate(batch)
    out.enrolled_count = len(batch.batch_students)
    return out


@router.post("/{batch_id}/students", status_code=status.HTTP_201_CREATED)
def enroll_student_in_batch(
    batch_id: int,
    enroll_req: EnrollmentRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    # Verify student exists and has student role
    student = db.query(User).filter(User.id == enroll_req.student_id).first()
    if not student or student.role.name != "student":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valid student account not found.")

    # Check capacity rule
    current_count = db.query(BatchStudent).filter(BatchStudent.batch_id == batch_id).count()
    if current_count >= batch.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch capacity limit ({batch.capacity} seats) has been reached. Cannot enroll student.",
        )

    # Check duplicate enrollment
    existing_map = db.query(BatchStudent).filter(
        BatchStudent.batch_id == batch_id,
        BatchStudent.student_id == enroll_req.student_id,
    ).first()
    if existing_map:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student is already enrolled in this batch.",
        )

    # Add mapping
    mapping = BatchStudent(batch_id=batch_id, student_id=enroll_req.student_id)
    db.add(mapping)

    # Also update or create course enrollment record
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == enroll_req.student_id,
        Enrollment.course_id == batch.course_id,
    ).first()
    if enrollment:
        enrollment.batch_id = batch_id
        enrollment.status = "active"
    else:
        enrollment = Enrollment(
            student_id=enroll_req.student_id,
            course_id=batch.course_id,
            batch_id=batch_id,
            status="active",
        )
        db.add(enrollment)

    db.commit()
    return {"message": "Student successfully enrolled in batch.", "batch_id": batch_id, "student_id": enroll_req.student_id}


@router.delete("/{batch_id}/students/{student_id}")
def remove_student_from_batch(
    batch_id: int,
    student_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    mapping = db.query(BatchStudent).filter(
        BatchStudent.batch_id == batch_id,
        BatchStudent.student_id == student_id,
    ).first()
    if not mapping:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student enrollment in batch not found.")

    db.delete(mapping)
    db.commit()
    return {"message": "Student removed from batch successfully."}
