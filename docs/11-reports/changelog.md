# Release Changelog & Version History

All notable changes to the Learning Management System (LMS) are documented in this file in accordance with [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-25 - Production Enterprise Release

### Added
- **Authentication & RBAC:** Multi-role JWT authentication (`admin`, `instructor`, `student`) with Bcrypt password hashing, session `/auth/me` lookup, and password changing.
- **24 Normalized Database Models:** Comprehensive schema across Users, Roles, Profiles, Courses, Modules, Batches, BatchStudents, Lectures, LectureProgress, Assignments, Submissions, Quizzes, Questions, QuizAttempts, Attendance, Payments, Certificates, Notifications, and ActivityLogs.
- **Alembic Migrations:** Reversible database migrations with PostgreSQL/MySQL/SQLite cross-engine support.
- **Seeder Pipeline:** Initial seed data generating 3 roles, 4 institutional demo accounts (`admin@lms.edu`, `instructor@lms.edu`, `student@lms.edu`, `jane@lms.edu`), 3 published courses, active batches, and assessment fixtures.
- **Academic Engine:** Video lecture streaming with Cloudinary support, coursework assignment submissions with deadline-based late flags, and timed MCQ quizzes with anti-cheating mechanisms (correct answers strictly omitted from client payloads).
- **Attendance Compliance:** Daily batch roll-call management with student compliance rate gauge and 75% minimum graduation alerts.
- **Financial Gateway:** Razorpay payment order generation in paise, HMAC-SHA256 signature verification, and printable tuition receipts.
- **Accredited Certificates:** ReportLab PDF certificate compiler with multi-criteria graduation evaluation and unauthenticated public verification portal (`/verify-certificate/:code`).
- **Reports & Intelligence:** Real-time KPI dashboard aggregations and RFC 4180 streaming CSV exports for enrollments and revenue audits.
- **Frontend SPA:** Complete React 18 single-page application styled with Tailwind CSS, supporting all 14 screens from the SRS wireframes specification, mobile responsiveness, and client-side route protection.
- **Comprehensive Documentation Pack:** SRS requirements notes, ERD diagram, data dictionary, wireframes spec, business rules, architecture & security guide, Postman collection, test plan & execution report, environment & deployment runbooks, user manuals, and technical viva preparation guide.

---

## [0.5.0] - 2026-11-25 - Academic Workflows & Financials Release
- Added Lectures, Assignments, Quizzes, and Attendance routers.
- Integrated Cloudinary media service with local mock fallback.
- Added Razorpay payment order and signature verification router.
- Added ReportLab PDF generation and public verification endpoint.
- Added Notifications and Reports analytics endpoints.

---

## [0.2.0] - 2026-11-25 - Core API & Database Schema Release
- Configured FastAPI application structure with SQLAlchemy ORM.
- Authored initial Alembic database migration for 24 relational tables.
- Implemented Auth, User directory, Courses catalogue, and Batches routers.
- Verified test suite with initial Pytest test cases.

---

## [0.1.0] - 2026-11-25 - Project Scaffolding & Requirements Analysis
- Initialized Git repository and master documentation directory structure (`docs/01` to `docs/11`).
- Analyzed 23-page LMS SRS specification (v1.1) and established development roadmap.
