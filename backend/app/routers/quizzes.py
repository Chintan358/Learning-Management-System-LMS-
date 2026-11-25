import datetime
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.quiz import Quiz, Question, QuizOption, QuizAttempt, QuizAnswer
from app.models.batch import BatchStudent
from app.models.user import User
from app.schemas.quiz import (
    QuizCreate,
    QuizOut,
    QuizStartOut,
    QuestionStudentOut,
    QuizOptionStudentOut,
    QuizSubmitRequest,
    QuizResultOut,
)
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/quizzes", tags=["Timed MCQ Examination"])


@router.get("", response_model=List[QuizOut])
def list_quizzes(
    batch_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.name == "student":
        enrolled = db.query(BatchStudent).filter(
            BatchStudent.batch_id == batch_id,
            BatchStudent.student_id == current_user.id,
        ).first()
        if not enrolled:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to batch quizzes.")

    quizzes = db.query(Quiz).filter(Quiz.batch_id == batch_id).all()
    results = []
    for q in quizzes:
        q_dict = QuizOut.model_validate(q)
        q_dict.questions_count = len(q.questions)
        results.append(q_dict)
    return results


@router.post("", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
def create_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(require_role(["admin", "instructor"])),
    db: Session = Depends(get_db),
):
    new_quiz = Quiz(
        batch_id=quiz_data.batch_id,
        title=quiz_data.title,
        description=quiz_data.description,
        duration_mins=quiz_data.duration_mins or 30,
        total_marks=quiz_data.total_marks or 100,
        passing_marks=quiz_data.passing_marks or 50,
        window_start=quiz_data.window_start,
        window_end=quiz_data.window_end,
        allow_retake=quiz_data.allow_retake or False,
    )
    db.add(new_quiz)
    db.flush()

    for q in quiz_data.questions:
        question = Question(
            quiz_id=new_quiz.id,
            question_text=q.question_text,
            marks=q.marks or 1,
        )
        db.add(question)
        db.flush()

        for opt in q.options:
            option = QuizOption(
                question_id=question.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct,
            )
            db.add(option)

    db.commit()
    db.refresh(new_quiz)
    out = QuizOut.model_validate(new_quiz)
    out.questions_count = len(new_quiz.questions)
    return out


@router.post("/{quiz_id}/start", response_model=QuizStartOut)
def start_quiz_attempt(
    quiz_id: int,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found.")

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    # Check window availability
    if now < quiz.window_start:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This quiz has not started yet.")
    if now > quiz.window_end:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz window has expired.")

    # Check retake policy
    existing_attempt = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.student_id == current_user.id,
    ).order_by(QuizAttempt.id.desc()).first()

    if existing_attempt and existing_attempt.status == "completed" and not quiz.allow_retake:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already completed this quiz. Retakes are not permitted.",
        )

    # Create new attempt session
    attempt = QuizAttempt(
        quiz_id=quiz_id,
        student_id=current_user.id,
        started_at=now,
        status="in_progress",
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Format questions (SECURITY: strictly withholding is_correct!)
    student_questions = []
    for q in quiz.questions:
        opts = [QuizOptionStudentOut(id=o.id, option_text=o.option_text) for o in q.options]
        student_questions.append(
            QuestionStudentOut(
                id=q.id,
                question_text=q.question_text,
                marks=q.marks,
                options=opts,
            )
        )

    return QuizStartOut(
        attempt_id=attempt.id,
        quiz_id=quiz.id,
        title=quiz.title,
        duration_mins=quiz.duration_mins,
        started_at=now,
        questions=student_questions,
    )


@router.post("/{quiz_id}/submit", response_model=QuizResultOut)
def submit_quiz_attempt(
    quiz_id: int,
    submit_req: QuizSubmitRequest,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.id == submit_req.attempt_id,
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.student_id == current_user.id,
    ).first()

    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active attempt session not found.")

    if attempt.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This attempt has already been submitted.")

    quiz = attempt.quiz
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    # Validate elapsed time (duration + 60s network grace period)
    max_seconds = (quiz.duration_mins * 60) + 60
    elapsed_seconds = (now - attempt.started_at).total_seconds()
    is_timed_out = elapsed_seconds > max_seconds

    # Evaluate answers server-side
    total_score = Decimal("0.00")
    for ans in submit_req.answers:
        opt = None
        is_correct = False
        marks_awarded = Decimal("0.00")

        if ans.selected_option_id:
            opt = db.query(QuizOption).filter(
                QuizOption.id == ans.selected_option_id,
                QuizOption.question_id == ans.question_id,
            ).first()

            if opt and opt.is_correct:
                is_correct = True
                q = db.query(Question).filter(Question.id == ans.question_id).first()
                marks_awarded = Decimal(str(q.marks if q else 1))
                total_score += marks_awarded

        # Save individual answer record
        answer_rec = QuizAnswer(
            attempt_id=attempt.id,
            question_id=ans.question_id,
            selected_option_id=ans.selected_option_id,
            is_correct=is_correct,
            marks_awarded=marks_awarded,
        )
        db.add(answer_rec)

    is_passed = total_score >= Decimal(str(quiz.passing_marks))
    attempt.submitted_at = now
    attempt.score = total_score
    attempt.is_passed = is_passed
    attempt.status = "timed_out" if is_timed_out else "completed"

    db.commit()
    db.refresh(attempt)

    return QuizResultOut(
        attempt_id=attempt.id,
        quiz_id=quiz.id,
        score=attempt.score,
        total_marks=quiz.total_marks,
        passing_marks=quiz.passing_marks,
        is_passed=attempt.is_passed,
        status=attempt.status,
        submitted_at=now,
    )
