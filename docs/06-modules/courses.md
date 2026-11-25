# Module Specification: Course & Curriculum Management
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Enables multi-tiered curriculum design, course publication, module sequencing, and lecture delivery:
- **Admin:** Full control over course creation, pricing, duration, publication status, and modules.
- **Instructor:** Content authoring for assigned courses (adding modules, lectures, video links, study materials).
- **Student:** Browsing published courses and consuming lecture curriculum upon enrollment.

---

## 2. Database Entities Involved
- `courses` (Course code, title, fee, duration, thumbnail, status: `draft`/`published`/`archived`)
- `course_modules` (Chapters with sequence `order_index`)
- `lectures` (Lessons with video links, duration, sequence)
- `study_materials` (Downloadable attachments, PDFs, slides)
- `enrollments` (Student course registration records)

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/courses` | List courses with category, status, search filters | Public / Auth |
| `POST` | `/api/v1/courses` | Create new course in catalogue | `admin` |
| `GET` | `/api/v1/courses/{id}` | Detailed course view with modules and lectures | Public / Auth |
| `PUT` | `/api/v1/courses/{id}` | Update course metadata, price, status | `admin`, `instructor` |
| `DELETE`| `/api/v1/courses/{id}` | Delete course (guarded against active enrollments) | `admin` |
| `POST` | `/api/v1/courses/{id}/modules` | Add module to course syllabus | `admin`, `instructor` |
| `POST` | `/api/v1/courses/modules/{id}/lectures` | Add lecture lesson to module | `admin`, `instructor` |

---

## 4. Business Rules & Guardrails
1. **Course Deletion Guard:** A course with active or pending student enrollments **cannot be deleted**. The API aborts with HTTP 409 Conflict, advising administrators to archive the course instead.
2. **Sequential Ordering:** Modules and lectures follow integer sequence indices (`order_index`, `sequence`) ensuring systematic syllabus delivery.
3. **Course Code Uniqueness:** Course codes (`course_code`) are unique across the institute.
