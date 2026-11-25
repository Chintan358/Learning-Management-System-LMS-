# Learning Management System (LMS) – REST API Reference Guide

**API Version:** `v1`  
**Base URL:** `http://localhost:8000/api/v1` (Local) / `https://lms-backend.onrender.com/api/v1` (Render Production)  
**Authentication Scheme:** `Bearer <JWT_ACCESS_TOKEN>` (RFC 7519 standard)  
**Response Formats:** `application/json` (standard data), `text/csv` (export feeds), `application/pdf` (binary credentials)

---

## 1. Global Response Standards

### 1.1 Success Response Formats
Standard successful requests return HTTP `200 OK` or `201 Created` with structured JSON payloads:
```json
{
  "id": 1,
  "title": "Full-Stack Web Engineering",
  "status": "published"
}
```

### 1.2 Error Response Format
When requests fail validation (`422`), authorization (`401`/`403`), resource lookup (`404`), or business constraints (`400`/`409`), FastAPI returns standard detail objects:
```json
{
  "detail": "Descriptive institutional policy violation or error message."
}
```

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Profile (`/auth`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticates credentials and issues JWT token | `{ email, password }` | `200 OK` |
| `POST` | `/auth/register` | Public | Enrolls new self-registered student account | `{ first_name, last_name, email, password, phone? }` | `201 Created` |
| `GET` | `/auth/me` | Authenticated | Retrieves current authenticated session user profile | *None* (Bearer Token) | `200 OK` |
| `POST` | `/auth/change-password` | Authenticated | Updates account password after validating old password | `{ current_password, new_password }` | `200 OK` |

---

### 2.2 User Directory & Management (`/users`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users` | `admin` | Lists institutional users with role and status filtering | Query: `?role=student&is_active=true` | `200 OK` |
| `POST` | `/users` | `admin` | Provisions staff or student user account | `{ first_name, last_name, email, password, role_name, phone? }` | `201 Created` |
| `GET` | `/users/{id}` | Authenticated | Retrieves specific user profile | Path: `id` (int) | `200 OK` |
| `PUT` | `/users/{id}` | `admin` / Self | Updates personal info, active state, or instructor bio | `{ first_name?, last_name?, phone?, is_active?, instructor_profile? }` | `200 OK` |
| `DELETE` | `/users/{id}` | `admin` | Soft-deactivates user from academic portal | Path: `id` (int) | `200 OK` |

---

### 2.3 Courses & Modules (`/courses`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/courses` | Authenticated | Lists published courses with search & category filters | Query: `?search=web&category=Tech` | `200 OK` |
| `POST` | `/courses` | `admin` | Creates new course catalogue syllabus | `{ course_code, title, description, category, duration_weeks, fee, status? }` | `201 Created` |
| `GET` | `/courses/{id}` | Authenticated | Retrieves syllabus breakdown, modules, and fee details | Path: `id` (int) | `200 OK` |
| `PUT` | `/courses/{id}` | `admin` | Updates course information, fee, or publish state | `{ title?, description?, fee?, status? }` | `200 OK` |
| `DELETE` | `/courses/{id}` | `admin` | Archives or removes course record | Path: `id` (int) | `200 OK` |
| `POST` | `/courses/{id}/modules` | `admin`, `instructor` | Adds curriculum module section to course | `{ title, description?, order_index }` | `201 Created` |

---

### 2.4 Batches & Capacity Allocation (`/batches`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/batches` | Authenticated | Lists batches (filtered by instructor/student enrollment) | Query: `?course_id=1` | `200 OK` |
| `POST` | `/batches` | `admin` | Provisions scheduled batch with strict capacity limit | `{ name, course_id, instructor_id, max_capacity, start_date, end_date, schedule_text }` | `201 Created` |
| `GET` | `/batches/{id}` | Authenticated | Retrieves batch timetable and roster enrollment list | Path: `id` (int) | `200 OK` |
| `POST` | `/batches/{id}/students` | `admin` | Enrolls student into batch verifying capacity limits | `{ student_id }` | `201 Created` |
| `DELETE` | `/batches/{id}/students/{student_id}` | `admin` | Removes or de-allocates student from batch roster | Path: `id`, `student_id` | `200 OK` |

---

### 2.5 Lectures & Media Streaming (`/lectures`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/lectures/course/{course_id}` | Authenticated | Lists lectures and study materials for course | Path: `course_id` (int) | `200 OK` |
| `POST` | `/lectures` | `admin`, `instructor` | Publishes video lecture and resource materials | `{ title, course_id, module_id?, video_url, duration_minutes, notes?, is_free_preview? }` | `201 Created` |
| `POST` | `/lectures/{id}/complete` | `student` | Toggles student lecture completion status | Path: `id` (int) | `200 OK` |

---

### 2.6 Assignments & Grading (`/assignments`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/assignments/course/{course_id}` | Authenticated | Lists assignments and active deadlines for course | Path: `course_id` (int) | `200 OK` |
| `POST` | `/assignments` | `admin`, `instructor` | Provisions coursework assignment with rubric marks | `{ title, course_id, description, max_marks, due_date }` | `201 Created` |
| `POST` | `/assignments/submit` | `student` | Submits solution text & Cloudinary upload attachment | `{ assignment_id, submission_text?, file_url? }` | `200 OK` |
| `POST` | `/assignments/grade` | `instructor`, `admin` | Evaluates submission, enters marks, and qualitative feedback | `{ submission_id, marks_obtained, feedback? }` | `200 OK` |

---

### 2.7 Timed MCQ Quizzes (`/quizzes`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/quizzes/{id}` | Authenticated | Retrieves quiz pre-exam view (omits correct answers) | Path: `id` (int) | `200 OK` |
| `POST` | `/quizzes` | `admin`, `instructor` | Configures timed quiz, passing score, and questions | `{ title, course_id, time_limit_minutes, passing_score, questions: [...] }` | `201 Created` |
| `POST` | `/quizzes/{id}/submit` | `student` | Submits answers for server-side evaluation & scoring | `{ quiz_id, answers: [{ question_id, selected_option }] }` | `200 OK` |

---

### 2.8 Batch Attendance Tracking (`/attendance`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/attendance` | `instructor`, `admin` | Submits roll-call attendance entries for batch session | `{ batch_id, class_date, records: [{ student_id, status, remarks }] }` | `200 OK` |
| `GET` | `/attendance/batch/{batch_id}` | `instructor`, `admin` | Retrieves attendance history for specific batch | Query: `?class_date=YYYY-MM-DD` | `200 OK` |
| `GET` | `/attendance/my-summary` | `student` | Retrieves student compliance rate vs 75% graduation requirement | *None* (Bearer Token) | `200 OK` |

---

### 2.9 Financials & Razorpay Gateway (`/payments`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/payments/create-order` | `student` | Initiates Razorpay payment order in paise | `{ amount, currency?, course_id?, batch_id? }` | `200 OK` |
| `POST` | `/payments/verify` | `student` | Verifies Razorpay HMAC signature & records payment | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, payment_method }` | `200 OK` |
| `GET` | `/payments` | `admin` | Institutional transaction ledger across all students | Query: `?status=completed` | `200 OK` |
| `GET` | `/payments/my-fees` | `student` | Student assessment summary, balance due, and receipts | *None* (Bearer Token) | `200 OK` |

---

### 2.10 Academic Certificates (`/certificates`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/certificates/generate` | `student` | Evaluates 5 graduation criteria and creates ReportLab PDF | `{ course_id }` | `201 Created` |
| `GET` | `/certificates/my-certificates` | `student` | Lists issued credentials and download links | *None* (Bearer Token) | `200 OK` |
| `GET` | `/certificates/verify/{code}` | **Public** | Public registry lookup verifying authenticity and tamper resistance | Path: `code` (string) | `200 OK` |

---

### 2.11 Notifications & Broadcasts (`/notifications`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Authenticated | Lists personal in-app alerts and announcements | Query: `?unread_only=false` | `200 OK` |
| `PUT` | `/notifications/{id}/read` | Authenticated | Marks alert notification as read | Path: `id` (int) | `200 OK` |
| `POST` | `/notifications/broadcast` | `admin` | Sends institute-wide announcement broadcast | `{ title, message, notification_type }` | `201 Created` |

---

### 2.12 Institutional Intelligence & Reporting (`/reports`)

| Method | Endpoint | Allowed Roles | Summary | Request Body / Params | Status Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/reports/dashboard` | Authenticated | Live KPI metrics and monthly enrollment/revenue trends | *None* (Bearer Token) | `200 OK` |
| `GET` | `/reports/export/enrollments` | `admin` | Streams CSV download of student admissions | *None* (Bearer Token) | `200 OK` (`text/csv`) |
| `GET` | `/reports/export/revenue` | `admin` | Streams CSV download of audited tuition payments | *None* (Bearer Token) | `200 OK` (`text/csv`) |
