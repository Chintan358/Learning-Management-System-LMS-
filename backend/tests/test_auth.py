import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_admin_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@lms.edu", "password": "Admin@Secure2026!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"]["name"] == "admin"


def test_student_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "student@lms.edu", "password": "Student@Secure2026!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"]["name"] == "student"


def test_login_wrong_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@lms.edu", "password": "WrongPassword123!"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_nonexistent_email():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@lms.edu", "password": "AnyPassword!"},
    )
    assert response.status_code == 401


def test_get_current_user_profile():
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@lms.edu", "password": "Admin@Secure2026!"},
    )
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@lms.edu"
    assert data["role"]["name"] == "admin"


def test_protected_route_without_token():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_student_registration():
    new_email = "newstudent@lms.edu"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Test",
            "last_name": "Learner",
            "email": new_email,
            "password": "Password@1234",
            "phone": "+91 9999988888",
            "role": "student",
        },
    )
    # 201 Created or 409 if already registered
    assert response.status_code in [201, 409]
    if response.status_code == 201:
        data = response.json()
        assert data["user"]["email"] == new_email
        assert data["user"]["role"]["name"] == "student"
