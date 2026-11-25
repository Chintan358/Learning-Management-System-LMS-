import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_token(email: str, password: str) -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


def test_admin_list_batches():
    admin_token = get_token("admin@lms.edu", "Admin@Secure2026!")
    response = client.get(
        "/api/v1/batches",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    batches = response.json()
    assert isinstance(batches, list)
    assert len(batches) >= 1
    assert batches[0]["batch_code"] == "BATCH-2026-WD01"


def test_student_list_batches_isolation():
    student_token = get_token("student@lms.edu", "Student@Secure2026!")
    response = client.get(
        "/api/v1/batches",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 200
    batches = response.json()
    # Student is only enrolled in BATCH-2026-WD01
    for b in batches:
        assert b["batch_code"] == "BATCH-2026-WD01"


def test_batch_capacity_rejection():
    admin_token = get_token("admin@lms.edu", "Admin@Secure2026!")
    # Create small batch with capacity = 1
    batch_code = "BATCH-CAP-TEST-01"
    res = client.post(
        "/api/v1/batches",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "batch_code": batch_code,
            "name": "Micro Cohort",
            "course_id": 1,
            "start_date": "2026-12-01",
            "end_date": "2026-12-31",
            "capacity": 1,
            "status": "upcoming",
        },
    )
    if res.status_code == 201:
        batch_id = res.json()["id"]

        # Enroll first student (Alex, id=3)
        res_enroll1 = client.post(
            f"/api/v1/batches/{batch_id}/students",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"student_id": 3},
        )
        assert res_enroll1.status_code == 201

        # Enroll second student (Jane, id=4) -> should be rejected because capacity = 1
        res_enroll2 = client.post(
            f"/api/v1/batches/{batch_id}/students",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"student_id": 4},
        )
        assert res_enroll2.status_code == 400
        assert "capacity limit" in res_enroll2.json()["detail"].lower()
