# Module Specification: Batch Scheduling & Enrollment Guard
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Organizes enrolled learners into time-bounded cohorts with assigned faculty:
- **Admin:** Configure batch timetables, assign instructors, manage rosters, and enforce seat limits.
- **Instructor:** View assigned cohort batches, access student rosters, and log classroom attendance.
- **Student:** View assigned batch schedules, timings, and peer rosters.

---

## 2. Database Entities Involved
- `batches` (Batch code, timetable, capacity, start/end dates, status)
- `batch_students` (Mapping student accounts to batches with unique constraint)
- `enrollments` (Student course registration tracking)
- `users` (Students and assigned instructors)

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/batches` | List batches (role-filtered for students/instructors) | Any Authenticated |
| `POST` | `/api/v1/batches` | Create new batch schedule | `admin` |
| `GET` | `/api/v1/batches/{id}` | Batch details with roster (authorized users only) | Any Authorized |
| `PUT` | `/api/v1/batches/{id}` | Update batch schedule, instructor, or status | `admin` |
| `POST` | `/api/v1/batches/{id}/students` | Allocate student to batch with capacity check | `admin` |
| `DELETE`| `/api/v1/batches/{id}/students/{id}` | De-allocate student from batch | `admin` |

---

## 4. Business Rules & Guardrails
1. **Capacity Limit Guard:** If `enrolled_count >= capacity`, enrollment attempts are aborted with HTTP 400 Bad Request: `"Batch capacity limit reached"`.
2. **Date Range Validation:** Batch `end_date` must strictly succeed `start_date`.
3. **Duplicate Prevention:** A student cannot be mapped twice into the same cohort.
4. **Data Isolation:** Students can only view batches in which they have active enrollment. Instructors can only view batches assigned to their user ID.
