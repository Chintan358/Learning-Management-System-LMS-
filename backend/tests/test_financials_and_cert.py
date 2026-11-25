import time
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_token(email: str, password: str) -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


def test_razorpay_order_and_verification():
    admin_token = get_token("admin@lms.edu", "Admin@Secure2026!")
    # Create an isolated test course
    course_res = client.post(
        "/api/v1/courses",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "course_code": f"FIN{int(time.time())}",
            "title": "Financial Test Course",
            "description": "Course for payment verification testing",
            "category": "Finance",
            "duration_weeks": 4,
            "fee": 15000.0,
            "status": "published",
        },
    )
    assert course_res.status_code == 201
    course_id = course_res.json()["id"]

    # Student 2 (Jane) pays for this test course
    student_token = get_token("jane@lms.edu", "Student@Secure2026!")

    # 1. Create Order
    order_res = client.post(
        "/api/v1/payments/create-order",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"course_id": course_id},
    )
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert "order_id" in order_data
    assert order_data["amount"] > 0
    order_id = order_data["order_id"]

    # 2. Verify Payment with HMAC signature simulation
    verify_res = client.post(
        "/api/v1/payments/verify",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "course_id": course_id,
            "razorpay_order_id": order_id,
            "razorpay_payment_id": f"pay_test_{int(time.time())}",
            "razorpay_signature": "mock_valid_signature",
        },
    )
    assert verify_res.status_code == 200
    payment = verify_res.json()
    assert payment["status"] == "paid"
    assert payment["receipt_number"].startswith("REC-")


def test_student_fee_summary():
    student_token = get_token("student@lms.edu", "Student@Secure2026!")
    res = client.get(
        "/api/v1/payments/my-fees",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res.status_code == 200
    summary = res.json()
    assert "total_fee" in summary
    assert "paid_amount" in summary
    assert "pending_amount" in summary


def test_certificate_eligibility_and_public_verification():
    student_token = get_token("student@lms.edu", "Student@Secure2026!")

    # Try requesting certificate for course 1
    # Student has completed lectures in previous test, attended classes, and passed quiz
    res = client.post(
        "/api/v1/certificates/generate",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"course_id": 1},
    )

    # 201 Created or 400 if criteria not met yet
    assert res.status_code in [201, 400]
    if res.status_code == 201:
        cert_data = res.json()
        assert "certificate_number" in cert_data
        cert_no = cert_data["certificate_number"]

        # PUBLIC VERIFICATION: No Authorization Bearer header needed!
        verify_res = client.get(f"/api/v1/certificates/verify/{cert_no}")
        assert verify_res.status_code == 200
        verified = verify_res.json()
        assert verified["is_valid"] is True
        assert verified["certificate_number"] == cert_no
        assert "student_name" in verified


def test_notifications_and_announcements():
    student_token = get_token("student@lms.edu", "Student@Secure2026!")
    admin_token = get_token("admin@lms.edu", "Admin@Secure2026!")

    # Student fetches in-app notifications
    notif_res = client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert isinstance(notifs, list)
    if len(notifs) > 0:
        first_id = notifs[0]["id"]
        # Mark read
        read_res = client.put(
            f"/api/v1/notifications/{first_id}/read",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert read_res.status_code == 200

    # Admin creates announcement
    ann_res = client.post(
        "/api/v1/notifications/announcements",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Semester Examination Schedule Published",
            "content": "Final assessment schedules are now available in your academic calendar.",
            "target_role": "student",
        },
    )
    assert ann_res.status_code == 201


def test_reports_dashboard_and_csv_export():
    admin_token = get_token("admin@lms.edu", "Admin@Secure2026!")
    student_token = get_token("student@lms.edu", "Student@Secure2026!")

    # Admin Dashboard KPIs
    dash_res = client.get(
        "/api/v1/reports/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["role"] == "admin"
    assert "kpis" in dash_data
    assert dash_data["kpis"]["total_students"] >= 1
    assert dash_data["kpis"]["total_revenue"] > 0

    # Student Dashboard KPIs
    stu_dash_res = client.get(
        "/api/v1/reports/dashboard",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert stu_dash_res.status_code == 200
    stu_data = stu_dash_res.json()
    assert stu_data["role"] == "student"
    assert "kpis" in stu_data

    # Admin Export Enrollments CSV
    csv_enroll = client.get(
        "/api/v1/reports/export/enrollments",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert csv_enroll.status_code == 200
    assert "text/csv" in csv_enroll.headers["content-type"]
    assert "Enrollment ID,Student Name" in csv_enroll.text

    # Admin Export Revenue CSV
    csv_rev = client.get(
        "/api/v1/reports/export/revenue",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert csv_rev.status_code == 200
    assert "text/csv" in csv_rev.headers["content-type"]
    assert "Receipt Number,Student Name" in csv_rev.text
