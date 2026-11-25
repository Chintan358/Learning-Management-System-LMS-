# Module Specification: Assignment & Grading Workflow
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Handles coursework issuance, student deliverable submission via Cloudinary, deadline enforcement, and instructor grading:
- **Instructor / Admin:** Authors assignments with deadlines and maximum marks, reviews student deliverables, and awards scores with qualitative feedback.
- **Student:** Downloads assignment briefs, uploads deliverables, tracks deadline statuses, and views evaluated marks.

---

## 2. Database Entities Involved
- `assignments` (Batch link, title, description, attachment URL, max marks, UTC due date, creator)
- `submissions` (Student link, file URL, submitted timestamp, `is_late` flag, status: `submitted`/`late`/`evaluated`)
- `assignment_feedback` (1:1 with submission: evaluator ID, marks awarded, qualitative commentary, evaluation timestamp)

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/assignments` | List batch assignments with submission counts | Any Batch Member |
| `POST` | `/api/v1/assignments` | Create assignment with due date & maximum marks | `admin`, `instructor` |
| `GET` | `/api/v1/assignments/{id}` | Assignment details & student's personal submission | Any Batch Member |
| `POST` | `/api/v1/assignments/{id}/submit` | Student submission with Cloudinary file URL | `student` |
| `GET` | `/api/v1/assignments/{id}/submissions` | View all student submissions for an assignment | `admin`, `instructor` |
| `POST` | `/api/v1/assignments/submissions/{id}/grade` | Grade submission with score & feedback | `admin`, `instructor` |

---

## 4. Business Rules & Guardrails
1. **Automated Late Detection:** If $\text{submitted\_at} > \text{due\_date}$, the system sets `is_late = True` and marks the status as `late`.
2. **Score Bounds:** Awarded marks cannot exceed `max_marks` (validated via HTTP 422).
3. **Resubmission Support:** Students can re-upload deliverables prior to instructor evaluation; the latest timestamp and file URL overwrite the existing submission.
