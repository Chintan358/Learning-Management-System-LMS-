import datetime
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.assignment import Assignment, Submission, AssignmentFeedback
from app.models.batch import Batch, BatchStudent
from app.models.user import User
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentOut,
    SubmissionCreate,
    SubmissionOut,
    GradeSubmissionRequest,
    FeedbackOut,
)
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/assignments", tags=["Assignment & Grading Workflow"])


@router.get("", response_model=List[AssignmentOut])
def list_assignments(
    batch_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify access to batch
    if current_user.role.name == "student":
        enrolled = db.query(BatchStudent).filter(
            BatchStudent.batch_id == batch_id,
            BatchStudent.student_id == current_user.id,
        ).first()
        if not enrolled:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to batch assignments.")

    assignments = db.query(Assignment).filter(Assignment.batch_id == batch_id).all()
    results = []
    for a in assignments:
        a_dict = AssignmentOut.model_validate(a)
        a_dict.submissions_count = len(a.submissions)
        results.append(a_dict)
    return results


@router.post("", response_model=AssignmentOut, status_code=status.HTTP_201_CREATED)
def create_assignment(
    asg_data: AssignmentCreate,
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == asg_data.batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    new_asg = Assignment(
        batch_id=asg_data.batch_id,
        title=asg_data.title,
        description=asg_data.description,
        attachment_url=asg_data.attachment_url,
        max_marks=asg_data.max_marks or 100,
        due_date=asg_data.due_date,
        created_by=current_user.id,
    )
    db.add(new_asg)
    db.commit()
    db.refresh(new_asg)
    return new_asg


@router.get("/{assignment_id}")
def get_assignment_detail(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    asg = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not asg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")

    my_submission = None
    if current_user.role.name == "student":
        sub = db.query(Submission).filter(
            Submission.assignment_id == assignment_id,
            Submission.student_id == current_user.id,
        ).first()
        if sub:
            my_submission = SubmissionOut.model_validate(sub)

    out = AssignmentOut.model_validate(asg)
    out.submissions_count = len(asg.submissions)
    return {
        "assignment": out,
        "my_submission": my_submission,
    }


@router.post("/{assignment_id}/submit", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
def submit_assignment(
    assignment_id: int,
    sub_data: SubmissionCreate,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    asg = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not asg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")

    # Check student enrollment in batch
    enrolled = db.query(BatchStudent).filter(
        BatchStudent.batch_id == asg.batch_id,
        BatchStudent.student_id == current_user.id,
    ).first()
    if not enrolled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not enrolled in this batch.")

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    is_late = now > asg.due_date
    status_label = "late" if is_late else "submitted"

    # Check if existing submission
    sub = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.student_id == current_user.id,
    ).first()

    if sub:
        # Update resubmission
        sub.file_url = sub_data.file_url
        sub.submitted_at = now
        sub.is_late = is_late
        sub.status = status_label
    else:
        sub = Submission(
            assignment_id=assignment_id,
            student_id=current_user.id,
            file_url=sub_data.file_url,
            submitted_at=now,
            is_late=is_late,
            status=status_label,
        )
        db.add(sub)

    db.commit()
    db.refresh(sub)
    return sub


@router.get("/{assignment_id}/submissions", response_model=List[SubmissionOut])
def list_submissions(
    assignment_id: int,
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    asg = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not asg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")

    submissions = db.query(Submission).filter(Submission.assignment_id == assignment_id).all()
    return submissions


@router.post("/submissions/{submission_id}/grade", response_model=FeedbackOut)
def grade_submission(
    submission_id: int,
    grade_data: GradeSubmissionRequest,
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")

    asg = sub.assignment
    if grade_data.marks_awarded > asg.max_marks:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Awarded marks ({grade_data.marks_awarded}) cannot exceed maximum points ({asg.max_marks}).",
        )

    # Upsert feedback
    feedback = db.query(AssignmentFeedback).filter(AssignmentFeedback.submission_id == submission_id).first()
    if feedback:
        feedback.marks_awarded = grade_data.marks_awarded
        feedback.feedback = grade_data.feedback
        feedback.evaluated_by = current_user.id
        feedback.evaluated_at = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    else:
        feedback = AssignmentFeedback(
            submission_id=submission_id,
            evaluated_by=current_user.id,
            marks_awarded=grade_data.marks_awarded,
            feedback=grade_data.feedback,
        )
        db.add(feedback)

    sub.status = "evaluated"
    db.commit()
    db.refresh(feedback)
    return feedback
