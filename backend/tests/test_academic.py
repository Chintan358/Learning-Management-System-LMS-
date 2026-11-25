import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_token(email: str, password: str) -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


def test_lecture_progress_tracking():
    student_token = get_token("student@lms.edu", "Student@Secure2026!")
    # Mark lecture 1 as completed
    response = client.post(
        "/api/v1/lectures/1/progress?is_completed=true",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_completed"] is True
    assert "course_progress_percentage" in data
    assert data["course_progress_percentage"] > 0


def test_assignment_submission_and_grading():
    student_token = get_token("student@lms.edu", "Student@Secure2026!")
    instructor_token = get_token("instructor@lms.edu", "Instructor@Secure2026!")

    # Student submits assignment 1
    sub_res = client.post(
        "/api/v1/assignments/1/submit",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"file_url": "https://res.cloudinary.com/demo/image/upload/sample_solution.pdf"},
    )
    assert sub_res.status_code == 201
    submission = sub_res.json()
    assert submission["status"] in ["submitted", "late"]
    submission_id = submission["id"]

    # Instructor grades the submission
    grade_res = client.post(
        f"/api/v1/assignments/submissions/{submission_id}/grade",
        headers={"Authorization": f"Bearer {instructor_token}"},
        json={
            "marks_awarded": 95.0,
            "feedback": "Outstanding implementation of responsive grid and Tailwind utility classes.",
        },
    )
    assert grade_res.status_code == 200
    feedback = grade_res.json()
    assert float(feedback["marks_awarded"]) == 95.0
    assert "Outstanding" in feedback["feedback"]


def test_quiz_attempt_and_server_side_scoring():
    admin_token = get_token("admin@lms.edu", "Admin@Secure2026!")
    student_token = get_token("student@lms.edu", "Student@Secure2026!")

    # 1. Create a dedicated test quiz
    create_res = client.post(
        "/api/v1/quizzes",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "batch_id": 1,
            "title": "Interactive Python & API Assessment",
            "duration_mins": 15,
            "total_marks": 20,
            "passing_marks": 10,
            "window_start": "2026-01-01T00:00:00",
            "window_end": "2026-12-31T23:59:59",
            "allow_retake": True,
            "questions": [
                {
                    "question_text": "What is FastAPI built on top of?",
                    "marks": 10,
                    "options": [
                        {"option_text": "Flask", "is_correct": False},
                        {"option_text": "Starlette and Pydantic", "is_correct": True},
                    ],
                },
                {
                    "question_text": "Which HTTP status code signifies resource creation?",
                    "marks": 10,
                    "options": [
                        {"option_text": "200 OK", "is_correct": False},
                        {"option_text": "201 Created", "is_correct": True},
                    ],
                },
            ],
        },
    )
    assert create_res.status_code == 201
    quiz_id = create_res.json()["id"]

    # 2. Start quiz attempt
    start_res = client.post(
        f"/api/v1/quizzes/{quiz_id}/start",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert start_res.status_code == 200
    quiz_paper = start_res.json()
    assert "attempt_id" in quiz_paper
    attempt_id = quiz_paper["attempt_id"]
    questions = quiz_paper["questions"]
    assert len(questions) == 2

    # CRITICAL SECURITY CHECK: is_correct must NOT be exposed to student!
    for q in questions:
        for opt in q["options"]:
            assert "is_correct" not in opt

    # 3. Submit answers (Selecting correct option for Q1 and Q2)
    submit_res = client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "attempt_id": attempt_id,
            "answers": [
                {"question_id": questions[0]["id"], "selected_option_id": questions[0]["options"][1]["id"]},
                {"question_id": questions[1]["id"], "selected_option_id": questions[1]["options"][1]["id"]},
            ],
        },
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert float(result["score"]) == 20.0  # 10 + 10 points
    assert result["is_passed"] is True
    assert result["status"] == "completed"


def test_attendance_marking_and_summary():
    instructor_token = get_token("instructor@lms.edu", "Instructor@Secure2026!")
    student_token = get_token("student@lms.edu", "Student@Secure2026!")

    # Instructor marks attendance for batch 1 on 2026-11-26
    mark_res = client.post(
        "/api/v1/attendance",
        headers={"Authorization": f"Bearer {instructor_token}"},
        json={
            "batch_id": 1,
            "class_date": "2026-11-26",
            "records": [
                {"student_id": 3, "status": "present"},
                {"student_id": 4, "status": "absent"},
            ],
        },
    )
    assert mark_res.status_code == 200
    assert "Successfully recorded" in mark_res.json()["message"]

    # Student views personal attendance summary
    summary_res = client.get(
        "/api/v1/attendance/my-summary",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_classes"] >= 2
    assert summary["attendance_percentage"] >= 50.0
