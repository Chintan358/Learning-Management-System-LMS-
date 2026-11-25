import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_token(email: str, password: str) -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


def test_list_courses():
    response = client.get("/api/v1/courses")
    assert response.status_code == 200
    courses = response.json()
    assert isinstance(courses, list)
    assert len(courses) >= 1
    assert courses[0]["course_code"] == "CS-FSW101"


def test_get_course_detail():
    response = client.get("/api/v1/courses/1")
    assert response.status_code == 200
    course = response.json()
    assert course["id"] == 1
    assert "modules" in course
    assert len(course["modules"]) >= 1


def test_admin_create_course():
    admin_token = get_token("admin@lms.edu", "Admin@Secure2026!")
    course_code = "CS-DEV-TEST-01"
    response = client.post(
        "/api/v1/courses",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "course_code": course_code,
            "title": "Cloud Native Python Architectures",
            "description": "Building microservices with FastAPI and Docker.",
            "category": "Cloud Computing",
            "duration_weeks": 8,
            "fee": 12500.00,
            "status": "published",
        },
    )
    assert response.status_code in [201, 409]
    if response.status_code == 201:
        data = response.json()
        assert data["course_code"] == course_code


def test_student_cannot_create_course():
    student_token = get_token("student@lms.edu", "Student@Secure2026!")
    response = client.post(
        "/api/v1/courses",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "course_code": "CS-HACK-01",
            "title": "Unauthorized Course",
            "category": "Testing",
            "fee": 0,
        },
    )
    assert response.status_code == 403
    assert "Operation not permitted" in response.json()["detail"]


def test_cannot_delete_enrolled_course():
    admin_token = get_token("admin@lms.edu", "Admin@Secure2026!")
    # Course 1 has active student enrollment seeded
    response = client.delete(
        "/api/v1/courses/1",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 409
    assert "active student enrollment" in response.json()["detail"]
