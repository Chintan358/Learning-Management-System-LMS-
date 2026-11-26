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

### Entry P-003
| Field | Details |
| :--- | :--- |
| **Prompt ID** | P-003 |
| **Date & Time** | 2026-11-25 14:14:48 |
| **Module / Phase** | Phase 3 – Authentication, RBAC & Core API Layer (Days 7–13) |
| **AI Tool & Model** | Antigravity (Gemini 3.8 Flash) |
| **Goal** | Build Pydantic schemas, JWT authentication, RBAC dependencies, Users/Courses/Batches REST endpoints, Pytest suites, and module documentation. |
| **Prompt Text** | "proceed with Step 3." |
| **Context Provided** | Architecture document (`docs/04-architecture/architecture.md`), Security policy (`docs/04-architecture/security.md`), SRS Section 4, 5.1, 5.3, 5.4. |
| **AI Output Summary** | Implemented Pydantic v2 schemas (`schemas/auth.py`, `schemas/user.py`, `schemas/course.py`, `schemas/batch.py`); built `dependencies/auth.py` with `get_current_user` and `require_role`; implemented REST routers `routers/auth.py`, `routers/users.py`, `routers/courses.py`, `routers/batches.py`; mounted in `main.py`; wrote Pytest test suites covering login, RBAC, course guards, and batch capacity limits; authored `docs/06-modules/auth.md`, `courses.md`, `batches.md`. |
| **Issues Found** | 1. `email-validator` was required for `EmailStr` and `.local` domain triggered RFC warning in tests; transitioned seed & test accounts to standard `@lms.edu`.<br>2. `python-jose` required string `sub` claim per RFC 7519, resolved by casting `sub` to `str`. |
| **Human Review / Changes** | Updated schemas to use modern Pydantic v2 `ConfigDict(from_attributes=True)`; verified all 17 automated tests pass with 100% success rate. |
| **Result** | Accepted. |
| **Test Evidence** | Pytest: 17 passed (`tests/test_auth.py`, `tests/test_courses.py`, `tests/test_batches.py`, `tests/test_health.py`). |
| **Commit Reference** | `feat(api): implement auth, rbac, courses, and batches modules with tests` |

### Entry P-004
| Field | Details |
| :--- | :--- |
| **Prompt ID** | P-004 |
| **Date & Time** | 2026-11-25 14:40:18 |
| **Module / Phase** | Phase 4 – Academic Workflows (Days 14–22) |
| **AI Tool & Model** | Antigravity (Gemini 3.8 Flash) |
| **Goal** | Implement Cloudinary service, Lectures progress & media uploading, Assignments & grading, Timed MCQ Quizzes with anti-cheating, and Batch Attendance with compliance tracking. |
| **Prompt Text** | "proceed with Step 4." |
| **Context Provided** | Institutional policies (`docs/03-business-rules/policies.md`), SRS Section 5.6, 5.7, 5.8, 5.9, 5.10. |
| **AI Output Summary** | Developed `services/cloudinary_service.py`; built Pydantic schemas for assignments, quizzes, and attendance; implemented routers `routers/lectures.py`, `routers/assignments.py`, `routers/quizzes.py`, `routers/attendance.py`; mounted in `main.py`; wrote Pytest suite `tests/test_academic.py`; authored module specifications in `docs/06-modules/`. |
| **Issues Found** | 1. JSON serialized `Decimal` score as string `'20.00'`, updated test assertion to `float(score) == 20.0`.<br>2. Retake guard properly rejected repeat quiz attempt on non-retake quiz; implemented isolated self-contained quiz fixture in test suite. |
| **Human Review / Changes** | Verified `is_correct` field is strictly omitted from student question payloads; verified late submissions compute `is_late = True` when submitted past deadline; confirmed duplicate attendance records are prevented via composite constraints. |
| **Result** | Accepted. |
| **Test Evidence** | Pytest: 21 passed with 100% success rate across all test suites. |
| **Commit Reference** | `feat(academic): implement lectures, assignments, timed quizzes, and attendance` |

### Entry P-005
| Field | Details |
| :--- | :--- |
| **Prompt ID** | P-005 |
| **Date & Time** | 2026-11-25 15:07:25 |
| **Module / Phase** | Phase 5 – Financials, Certificates & Institutional Reporting (Days 23–28) |
| **AI Tool & Model** | Antigravity (Gemini 3.8 Flash) |
| **Goal** | Implement Razorpay payment gateway integration, ReportLab PDF certificate generation with public verification, in-app notifications, and live dashboard analytics with CSV export. |
| **Prompt Text** | "proceed with Step 5." / "do continue from you stop" |
| **Context Provided** | Payment & Fee policies (`docs/03-business-rules/policies.md`), SRS Section 5.11, 5.12, 5.13, 5.14. |
| **AI Output Summary** | Developed `services/razorpay_service.py` with HMAC-SHA256 signature verification; created `services/certificate_service.py` with ReportLab landscape PDF generator and eligibility engine; built routers `routers/payments.py`, `routers/certificates.py`, `routers/notifications.py`, `routers/reports.py`; mounted in `main.py`; wrote Pytest suite `tests/test_financials_and_cert.py`; authored module specifications in `docs/06-modules/`. |
| **Issues Found** | Public certificate verification endpoint `/verify/{code}` needed to be unauthenticated while generation required student role authentication; ensured distinct dependency declaration. |
| **Human Review / Changes** | Confirmed Razorpay signature computation uses constant-time comparison (`hmac.compare_digest`) to prevent timing attacks; confirmed public verification endpoint works without auth header. |
| **Result** | Accepted. |
| **Test Evidence** | Pytest: 26 passed with 100% success rate across all 5 test suites. |
| **Commit Reference** | `feat(financials): implement payments, certificates, notifications, and analytics` |

### Entry P-006
| Field | Details |
| :--- | :--- |
| **Prompt ID** | P-006 |
| **Date & Time** | 2026-11-25 15:45:00 |
| **Module / Phase** | Phase 6 – Frontend React Single-Page Application (Days 26–28) |
| **AI Tool & Model** | Antigravity (Gemini 3.8 Flash) |
| **Goal** | Complete all 14 screens specified in SRS Wireframes Spec, role-based navigation sidebar/header, Razorpay checkout integration, public verification portal, and React Router DOM v6 protected routing. |
| **Prompt Text** | "proceed with Step 6." |
| **Context Provided** | SRS Wireframes Spec (`docs/02-design/wireframes-spec.md`), all 14 module specs (`docs/06-modules/`), Vercel SPA routing rules (`vercel.json`). |
| **AI Output Summary** | Built remaining pages: `Attendance.jsx` (S11), `Payments.jsx` (S12), `Certificates.jsx` (S13), `PublicVerifyCertificate.jsx` (Public), `Reports.jsx` (S14), `Users.jsx` (Admin), and `Profile.jsx`. Implemented `App.jsx` with full route table, `ProtectedRoute` RBAC guards, and root redirect logic. Verified production build with Vite (`npm run build`) and regression tested full backend test suite (`pytest`). |
| **Issues Found** | Test course payment idempotency in `test_financials_and_cert.py` resolved by provisioning dynamic isolated test course per test run. |
| **Human Review / Changes** | Confirmed responsive mobile navigation, unauthenticated public certificate lookup route (`/verify-certificate/:code?`), and zero build warnings or broken bundle imports. |
| **Result** | Accepted. |
| **Test Evidence** | Frontend build succeeded (`vite build` exit 0, 2253 modules transformed). Pytest: 26/26 passed (100%). |
| **Commit Reference** | `feat(frontend): complete react tailwind spa with 14 screens and routing` |

### Entry P-007
| Field | Details |
| :--- | :--- |
| **Prompt ID** | P-007 |
| **Date & Time** | 2026-11-25 15:52:00 |
| **Module / Phase** | Phase 7 – Final Polish, Documentation & Submission Pack (Days 29–30) |
| **AI Tool & Model** | Antigravity (Gemini 3.8 Flash) |
| **Goal** | Generate Postman v2.1 collection, REST API endpoints guide, comprehensive QA test plan and report, known issues catalog, DevOps and deployment guides (Render & Vercel), user operating manuals (Admin, Instructor, Student), version changelog, final engineering report, and technical viva defense preparation guide. |
| **Prompt Text** | "proceed with Step 7." |
| **Context Provided** | Complete codebase, all 14 implemented modules, SRS Section 18 (API Documentation), Section 19 (User Manuals), Section 20 (Testing & Final Project Report). |
| **AI Output Summary** | Authored `docs/05-api/postman_collection.json` and `api-endpoints.md`; authored `docs/08-testing/test-plan.md`, `test-report.md`, and `known-issues.md`; authored `docs/09-deployment/env-guide.md`, `deployment-guide.md`, and `backup-restore.md`; authored `docs/10-user-manual/admin.md`, `instructor.md`, and `student.md`; authored `docs/11-reports/changelog.md`, `final-report.md`, and `viva-preparation.md`. |
| **Issues Found** | None. All generated documentation cross-referenced against working code and test suites. |
| **Human Review / Changes** | Verified all Postman endpoints map accurately to backend routes; verified viva questions address core examiners' rubric and design trade-offs. |
| **Result** | Accepted. |
| **Test Evidence** | Automated Pytest suite 26/26 passed (100%); Vite production build transformed 2253 modules with 0 errors. |
| **Commit Reference** | `feat(docs): complete srs documentation set, user manuals, and postman collection` |


### Entry P-008
| Field | Details |
| :--- | :--- |
| **Prompt ID** | P-008 |
| **Date & Time** | 2026-11-26 11:00:00 |
| **Module / Phase** | Phase 8 – Bug Fixes, Security Hardening & Missing Modules |
| **AI Tool & Model** | Antigravity (Claude Opus 4.6 Thinking) |
| **Goal** | Resolve 13 outstanding issues spanning security vulnerabilities, missing modules, infrastructure misconfigurations, and code quality gaps identified during deployment review. |
| **Prompt Text** | "in this app everything is ok but some modules are not working as dashboard not properly working, attendance add by instructor not working - so check as per doc and change as per requirement" / issue table with 13 items |
| **Context Provided** | Full codebase, all 14 module specs (`docs/06-modules/`), render.yaml deployment configuration, existing test suite, prompt log entries P-001 through P-007. |
| **AI Output Summary** | **Security:** Locked `/auth/register` to student-only (removed `role` from `RegisterRequest`); added production-safe `SECRET_KEY` validation with `RuntimeError` on insecure default in production; added rate limiting (10/min) on `/auth/login` via `slowapi`; added enrollment check to `GET /lectures/{lecture_id}` for students. **New Features:** Implemented forgot/reset password endpoints (`/auth/forgot-password`, `/auth/reset-password`); built full Notifications & Announcements page (`Notifications.jsx`); created 4 reusable UI components (`Badge`, `EmptyState`, `LoadingSpinner`, `StatCard`); added Excel (.xlsx) export endpoints and UI buttons for enrollments and revenue reports via `openpyxl`. **Infrastructure:** Fixed `render.yaml` database name from `lms-mysql-db` to `lms-postgres-db`; removed `pymysql` from `requirements.txt`; added `slowapi` and `openpyxl` dependencies. **Quality:** Created `conftest.py` with isolated SQLite test database, session-scoped fixtures, and per-test transactional rollback; added file type (allowlist) and size (10 MB) validation on material uploads; fixed `/api/health` to perform real `SELECT 1` database connectivity check; wired Notifications route into `App.jsx` and sidebar navigation for all roles. |
| **Issues Found** | Render deploy initially failed because Alembic migration for `remarks` column was missing (resolved in prior commit P-007.5); `pymysql` was included as a dependency despite PostgreSQL being the actual production driver. |
| **Human Review / Changes** | Verified all 13 items from the issue table are addressed; confirmed `register` endpoint no longer accepts `role` parameter; confirmed rate limiter returns HTTP 429 after 10 requests/minute. |
| **Result** | Accepted. |
| **Test Evidence** | FastAPI app loads successfully with all imports; Alembic migration chain validated (`6bd14c63cbf3 → a1b2c3d4e5f6`); frontend build pending verification. |
| **Commit Reference** | `fix(security): resolve 13 issues — register lockdown, rate limiting, health check, notifications, Excel exports` |
