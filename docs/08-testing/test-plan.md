# Quality Assurance & Test Strategy Plan

**Document Version:** `1.0.0`  
**Target Application:** Enterprise Learning Management System (LMS)  
**Testing Frameworks:** Pytest 9.2+, Starlette TestClient, AnyIO, Vitest & Vite Build Verification

---

## 1. Test Objectives & Quality Goals

The LMS quality assurance strategy verifies that all 14 core operational modules defined in the Software Requirements Specification (SRS v1.1) meet functional accuracy, non-functional security constraints, and data integrity guarantees.

### Key Quality Objectives:
1. **Zero Hardcoded Metrics:** Verify all metrics and KPIs compute directly via database aggregations (`SUM`, `COUNT`, `AVG`).
2. **Strict RBAC Enforcement:** Ensure no student can access instructor or admin endpoints regardless of frontend manipulation.
3. **Financial Integrity:** Validate that Razorpay payment verification uses cryptographic HMAC-SHA256 signature checks before recording tuition fee settlements.
4. **Anti-Cheating Assurance:** Confirm that exam question payloads completely exclude `is_correct` flags, and timed exams enforce non-retake rules.
5. **Graduation Eligibility Formula:** Verify that certificate generation strictly validates the 5 graduation criteria ($100\%$ lectures, $\ge 75\%$ attendance, $\ge 50\%$ assignment marks, $\ge 50\%$ quiz score, $100\%$ fees cleared).

---

## 2. Test Scope & Module Matrix

| Module | Test Focus | Method / Tool | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **01 Auth & RBAC** | Password hashing, JWT claims, role restrictions, password changing | Automated Pytest (`test_auth.py`) | Passwords hashed with bcrypt; 401 on bad credentials; 403 on role mismatch |
| **02 Courses & Modules** | Catalog listing, admin course creation, syllabus tree structure | Automated Pytest (`test_courses.py`) | 201 Created for admin; unauthorized role denied |
| **03 Batches & Capacity** | Scheduled batch allocation, capacity overfill guard | Automated Pytest (`test_batches.py`) | Rejection (400) when batch reaches `max_capacity` |
| **04 Lectures & Cloud Media** | Lecture completion toggles, course progress calculation | Automated Pytest (`test_academic.py`) | Completion correctly updates percentage (0–100%) |
| **05 Assignments & Grading** | File submission, late submission deadline detection, grading | Automated Pytest (`test_academic.py`) | Past deadline sets `is_late=True`; marks recorded |
| **06 Timed Quizzes** | Answer exclusion from examinees, countdown scoring, retake guard | Automated Pytest (`test_academic.py`) | Server scores answers; repeats rejected |
| **07 Batch Attendance** | Roll-call logging, duplicate date rejection, student summary | Automated Pytest (`test_academic.py`) | Student compliance percentage accurately calculated |
| **08 Razorpay Payments** | Order creation (paise), HMAC-SHA256 signature verification | Automated Pytest (`test_financials_and_cert.py`) | Tampered signatures rejected; valid records completed |
| **09 PDF Certificates** | Multi-criteria evaluation, ReportLab PDF generation, public verification | Automated Pytest (`test_financials_and_cert.py`) | Ineligible requests fail; valid generate unique code |
| **10 Notifications** | In-app alerts, unread status toggles, broadcast announcements | Automated Pytest (`test_financials_and_cert.py`) | Unread notifications filterable; broadcast reaches all |
| **11 Reports & Analytics** | Real-time KPI aggregation, CSV streaming downloads | Automated Pytest (`test_financials_and_cert.py`) | CSV formats valid RFC 4180 with correct headers |
| **12 Frontend SPA** | Route authorization, mobile responsiveness, build integrity | Vite Build (`npm run build`) | Bundle compiles with exit code 0 |

---

## 3. Test Environment & Setup

- **Backend Test Runner:** Pytest 9.2.0 on Python 3.13.5 (Windows Virtual Environment)
- **Database Fixture:** In-memory or local SQLite test database (`lms.db`) with pre-seeded roles and demo accounts.
- **Frontend Test Runner:** Vite 5.4.21 bundle transformer with Rollup minifier.
- **Continuous Execution Command:**
  ```powershell
  # Backend
  cd backend
  .\venv\Scripts\pytest -v --disable-warnings

  # Frontend
  cd frontend
  npm run build
  ```

---

## 4. Test Pass/Fail Acceptance Criteria

1. **Backend Acceptance:** 100% test cases passing in the Pytest suite (0 failures, 0 errors).
2. **Frontend Acceptance:** Zero compile errors or missing module imports during Vite production bundling.
3. **Security Standards:** All protected API endpoints must return HTTP 401 for missing tokens and HTTP 403 for unauthorized roles.
