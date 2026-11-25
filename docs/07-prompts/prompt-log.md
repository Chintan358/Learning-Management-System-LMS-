# AI Prompt Documentation & Prompt Log
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

According to SRS Section 20, every significant prompt directed toward the implementation of the LMS is tracked in this log with its context, output summary, issues identified, human review notes, test evidence, and commit references.

---

## Prompt Log Entries

### Entry P-001
| Field | Details |
| :--- | :--- |
| **Prompt ID** | P-001 |
| **Date & Time** | 2026-11-25 13:37:47 |
| **Module / Phase** | Phase 1 – Architecture & Baseline Documentation (Days 1–3) |
| **AI Tool & Model** | Antigravity (Gemini 3.8 Flash) |
| **Goal** | Scaffold the LMS project repository structure, git initialization, and generate SRS-compliant foundational documentation. |
| **Prompt Text** | "procedd with step 1" (Initial instruction: Analyze document, full functionality, all reports/docs, senior full-stack standards, step-by-step, Vercel frontend, Render backend/database, Cloudinary for images, Razorpay for payments). |
| **Context Provided** | LMS Full-Stack Project Assignment & Software Requirements Specification (SRS v1.1, 23 pages). |
| **AI Output Summary** | Initialized git repository; established complete directory hierarchy (`docs/`, `backend/`, `frontend/`); generated `srs-notes.md`, `use-cases.md`, `erd.md`, `data-dictionary.md`, `wireframes-spec.md`, `policies.md`, `architecture.md`, `security.md`, `master-prompt.md`, `progress-log.md`, and root `README.md`. |
| **Issues Found** | Ensure Cloudinary and Razorpay dependencies are explicitly represented across the data dictionary, architecture diagram, and security policy alongside standard SRS models. |
| **Human Review / Changes** | Verified all 24 database entities match SRS Section 6; verified Cloudinary URLs and Razorpay transaction IDs are included in respective entities; confirmed Vercel and Render deployment configurations. |
| **Result** | Accepted. |
| **Test Evidence** | All documents generated and validated against SRS Section 19.1 standards. |
| **Commit Reference** | `feat(init): scaffold directory structure and foundational documentation` |

### Entry P-002
| Field | Details |
| :--- | :--- |
| **Prompt ID** | P-002 |
| **Date & Time** | 2026-11-25 13:50:07 |
| **Module / Phase** | Phase 2 – Database & Backend Core Setup (Days 4–6) |
| **AI Tool & Model** | Antigravity (Gemini 3.8 Flash) |
| **Goal** | Implement backend configuration, SQLAlchemy 2.0 ORM models for all 24 entities, Alembic migrations, database seeder, security utilities, and health check endpoints. |
| **Prompt Text** | "proceed with step 2" |
| **Context Provided** | Data dictionary (`docs/02-design/data-dictionary.md`), ERD (`docs/02-design/erd.md`), SRS Section 6, 7, 9.2. |
| **AI Output Summary** | Configured `backend/requirements.txt` with locked versions; built `app/config.py` and `app/database.py`; defined all 24 SQLAlchemy models across `models/user.py`, `models/course.py`, `models/batch.py`, `models/assignment.py`, `models/quiz.py`, `models/attendance.py`, `models/certificate.py`, `models/payment.py`, `models/notification.py`; generated Alembic migration `6bd14c63cbf3`; implemented comprehensive seeder `seed_data.py` with multi-role synthetic data; wrote security hashing & JWT utilities; created `main.py` and passed automated Pytest test suite. |
| **Issues Found** | Initial Pytest run required `pythonpath = .` in `pytest.ini` to resolve `app` package path in Windows environment. |
| **Human Review / Changes** | Added `pytest.ini` with `pythonpath = .`; verified seeder runs with 0 errors and commits all sample roles, users, courses, batches, assignments, quizzes, and attendance records. |
| **Result** | Accepted. |
| **Test Evidence** | Pytest: 2 passed (`test_root_endpoint`, `test_health_check_endpoint`); Database seed: 100% successful. |
| **Commit Reference** | `feat(backend): implement 24 database models, migrations, seeder and core api` |
