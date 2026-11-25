from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Course, CourseModule, Lecture, StudyMaterial
from app.models.batch import Enrollment
from app.models.user import User
from app.schemas.course import (
    CourseOut,
    CourseDetailOut,
    CourseCreate,
    CourseUpdate,
    CourseModuleOut,
    ModuleCreate,
    ModuleUpdate,
    LectureOut,
    LectureCreate,
    LectureUpdate,
    StudyMaterialCreate,
    StudyMaterialOut,
)
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/courses", tags=["Course & Curriculum Management"])


@router.get("", response_model=List[CourseOut])
def list_courses(
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Course)
    if status_filter:
        query = query.filter(Course.status == status_filter)
    if category:
        query = query.filter(Course.category.ilike(f"%{category}%"))
    if search:
        pattern = f"%{search}%"
        query = query.filter((Course.title.ilike(pattern)) | (Course.course_code.ilike(pattern)))

    return query.offset(skip).limit(limit).all()


@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    existing = db.query(Course).filter(Course.course_code == course_data.course_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Course code '{course_data.course_code}' already exists.",
        )

    new_course = Course(
        course_code=course_data.course_code,
        title=course_data.title,
        description=course_data.description,
        category=course_data.category,
        duration_weeks=course_data.duration_weeks or 4,
        fee=course_data.fee or 0.00,
        thumbnail_url=course_data.thumbnail_url,
        status=course_data.status or "draft",
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course


@router.get("/{course_id}", response_model=CourseDetailOut)
def get_course_detail(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
    return course


@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    course_data: CourseUpdate,
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    update_dict = course_data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(course, field, val)

    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    # Guard: prevent deletion if active student enrollments exist
    active_enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.status.in_(["active", "pending"]),
    ).count()

    if active_enrollments > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete course. It has {active_enrollments} active student enrollment(s). Archive the course instead.",
        )

    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully."}


# Module & Lecture Management
@router.post("/{course_id}/modules", response_model=CourseModuleOut, status_code=status.HTTP_201_CREATED)
def add_module_to_course(
    course_id: int,
    module_data: ModuleCreate,
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    new_module = CourseModule(
        course_id=course_id,
        title=module_data.title,
        description=module_data.description,
        order_index=module_data.order_index or 1,
    )
    db.add(new_module)
    db.commit()
    db.refresh(new_module)
    return new_module


@router.post("/modules/{module_id}/lectures", response_model=LectureOut, status_code=status.HTTP_201_CREATED)
def add_lecture_to_module(
    module_id: int,
    lecture_data: LectureCreate,
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    mod = db.query(CourseModule).filter(CourseModule.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course module not found.")

    new_lecture = Lecture(
        module_id=module_id,
        title=lecture_data.title,
        description=lecture_data.description,
        video_url=lecture_data.video_url,
        duration_mins=lecture_data.duration_mins or 0,
        sequence=lecture_data.sequence or 1,
    )
    db.add(new_lecture)
    db.commit()
    db.refresh(new_lecture)
    return new_lecture
