# Requirement Analysis & SRS Notes
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  
**Status:** Approved Baseline  

---

## 1. Project Understanding & Background
The Learning Management System (LMS) is an institutional-grade, multi-tenant academic and operational management web application designed for vocational and training institutes. It replaces fragmented administration (spreadsheets, third-party form builders, and disconnected payment gateways) with a single unified, role-based platform serving:
1. **Administrators (System & Institute Management)**
2. **Instructors (Faculty & Evaluators)**
3. **Students (Learners)**

The architecture follows a strict separation of concerns:
- **Frontend Presentation Layer:** React.js Single Page Application (SPA) with Tailwind CSS, Recharts for visual analytics, and responsive layout for mobile and desktop viewports.
- **Backend API & Business Logic Layer:** Python FastAPI delivering high-throughput RESTful JSON endpoints with Pydantic request/response validation, dependency-injected JWT authentication, and RBAC authorization filters.
- **Persistence Layer:** Relational MySQL managed database driven by SQLAlchemy ORM with migrations via Alembic.
- **External Integrated Services:**
  - **Cloudinary:** Cloud-based object and media management for course thumbnails, student avatar images, lecture files, and student assignment submissions.
  - **Razorpay:** Payment gateway powering course fee invoices, checkout sessions, cryptographic signature verification, and automated transaction receipts.
  - **ReportLab / WeasyPrint Engine:** Server-side PDF generation for tamper-evident completion certificates and payment receipts.

---

## 2. In-Scope Features
As specified in SRS v1.1 Section 3.1:
* **Authentication & Role-Based Access Control:**
  - Secure registration, login, logout, password change, forgot/reset password workflows.
  - JWT token generation with expiration and secure storage guidelines.
  - Backend role validation (Admin, Instructor, Student) on all protected routes.
* **Role-Specific Dashboards:**
  - Dynamic KPI cards, enrollment trends, revenue summaries, pending evaluations, and recent activities.
  - Zero hardcoding; all metrics computed from live database queries.
* **Course & Module Management:**
  - Hierarchical course structure (Courses -> Modules -> Lectures & Materials).
  - Categorization, duration, fees, publication status (Draft, Published, Archived), and soft-delete safeguards against enrolled courses.
* **Batch Scheduling & Roster Management:**
  - Timetable, start/end dates, capacity enforcement, student allocation, and instructor assignment.
* **User & Profile Management:**
  - Centralized student and instructor directory with search, filter, and activation toggling.
* **Lecture & Study Material Delivery:**
  - Video URLs and Cloudinary file hosting for slide decks, PDF guides, and notes.
  - Lecture completion tracking per student.
* **Assignments & Grading Workflow:**
  - Rich assignment creation with due dates, maximum marks, and reference attachments.
  - Student file submissions, late submission flagging, and instructor evaluation with qualitative feedback and numeric scoring.
* **Timed Quiz & Examination Engine:**
  - Timed MCQ assessments with question-option shuffling.
  - Server-side timer validation and automated scoring to prevent client-side score spoofing.
  - Answer review visibility governed by completion policies.
* **Attendance Tracking & Aggregation:**
  - Instructor roll-call entry with duplicate session prevention.
  - Student attendance percentage computation: `(Present Sessions / Total Eligible Sessions) * 100`.
* **Student Progress Tracking:**
  - Computed progress indicator reflecting lecture completion, assignment completion, and quiz scores.
* **Certificate Generation & Verification:**
  - Automated PDF certificate generation upon meeting course completion criteria.
  - Unique certificate identifier and public `/verify-certificate/{code}` verification page.
* **Payments & Fee Management:**
  - Full and installment/partial payment tracking.
  - Razorpay checkout integration with server-side HMAC-SHA256 signature verification.
  - Downloadable PDF fee receipts.
* **Notifications & Broadcast Announcements:**
  - In-app notification bell with read/unread status.
  - Institute-wide or batch-specific announcements.
* **Operational Reports & Exports:**
  - Filterable reports for revenue, enrollments, attendance, and grades with CSV and PDF export capabilities.

---

## 3. Out-of-Scope Features (SRS Section 3.2)
The initial release explicitly excludes:
- AI-driven auto-tutoring or machine grading.
- Native mobile applications (iOS/Android); mobile support is delivered via responsive web design.
- In-house WebRTC live streaming infrastructure (external links to Zoom/Google Meet are supported).
- Automated multi-party tax compliance and automated international currency settlement.
- Biometric hardware integration or automated eye-tracking proctoring.

---

## 4. Key Assumptions & Technical Clarifications
1. **Database Compatibility:**
   - The production database will be MySQL 8.0 on Render / Cloud MySQL.
   - For continuous integration and rapid local developer testing without Docker, SQLite may be supported conditionally in test environments, while production strictly targets MySQL.
2. **File Storage Isolation:**
   - Production media assets will be streamed to Cloudinary, returning secure HTTPS URLs stored in MySQL.
   - Local uploads directory is retained strictly for local development and fallback storage.
3. **Razorpay Mode:**
   - Test mode credentials (`rzp_test_...`) will be configured in `.env.example` with fallback simulation support for non-credentialed local testing.
4. **Target Deployment Environments:**
   - **Frontend:** Vercel with single-page application (SPA) rewrites configured via `vercel.json`.
   - **Backend:** Render Web Service running Uvicorn under Python 3.12+ / Docker.
