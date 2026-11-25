from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Lecture, StudyMaterial, LectureProgress, CourseModule, Course
from app.models.user import User
from app.schemas.course import LectureOut, StudyMaterialOut
from app.dependencies.auth import get_current_user, require_role
from app.services.cloudinary_service import upload_file_to_cloudinary

router = APIRouter(prefix="/lectures", tags=["Lecture & Study Materials"])


@router.get("/{lecture_id}")
def get_lecture(
    lecture_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found.")

    is_completed = False
    if current_user.role.name == "student":
        progress = db.query(LectureProgress).filter(
            LectureProgress.student_id == current_user.id,
            LectureProgress.lecture_id == lecture_id,
        ).first()
        is_completed = progress.is_completed if progress else False

    return {
        "id": lecture.id,
        "module_id": lecture.module_id,
        "title": lecture.title,
        "description": lecture.description,
        "video_url": lecture.video_url,
        "duration_mins": lecture.duration_mins,
        "sequence": lecture.sequence,
        "is_completed": is_completed,
        "materials": [StudyMaterialOut.model_validate(m) for m in lecture.materials],
    }


@router.post("/{lecture_id}/progress")
def mark_lecture_progress(
    lecture_id: int,
    is_completed: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found.")

    progress = db.query(LectureProgress).filter(
        LectureProgress.student_id == current_user.id,
        LectureProgress.lecture_id == lecture_id,
    ).first()

    if progress:
        progress.is_completed = is_completed
    else:
        progress = LectureProgress(
            student_id=current_user.id,
            lecture_id=lecture_id,
            is_completed=is_completed,
        )
        db.add(progress)

    db.commit()

    # Compute total course progress for this student
    module = db.query(CourseModule).filter(CourseModule.id == lecture.module_id).first()
    course_id = module.course_id
    total_lectures = db.query(Lecture).join(CourseModule).filter(CourseModule.course_id == course_id).count()
    completed_lectures = (
        db.query(LectureProgress)
        .join(Lecture)
        .join(CourseModule)
        .filter(
            CourseModule.course_id == course_id,
            LectureProgress.student_id == current_user.id,
            LectureProgress.is_completed == True,
        )
        .count()
    )

    percentage = round((completed_lectures / total_lectures * 100), 1) if total_lectures > 0 else 0.0

    return {
        "message": "Lecture progress recorded.",
        "lecture_id": lecture_id,
        "is_completed": is_completed,
        "total_course_lectures": total_lectures,
        "completed_course_lectures": completed_lectures,
        "course_progress_percentage": percentage,
    }


@router.post("/{lecture_id}/materials", response_model=StudyMaterialOut, status_code=status.HTTP_201_CREATED)
async def upload_study_material(
    lecture_id: int,
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found.")

    file_bytes = await file.read()
    upload_res = upload_file_to_cloudinary(
        file_bytes=file_bytes,
        filename=file.filename,
        folder="lms_materials",
        resource_type="auto",
    )

    material = StudyMaterial(
        lecture_id=lecture_id,
        title=title,
        file_url=upload_res["secure_url"],
        file_type=upload_res.get("format") or "bin",
        file_size_kb=round(upload_res.get("bytes", 0) / 1024),
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material
