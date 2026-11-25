# Module Specification: Attendance Tracking & Compliance
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Enforces institutional session attendance compliance required for certification eligibility:
- **Instructor / Admin:** Conducts roll call for batch sessions by date, records student presence/absence, and tracks adherence.
- **Student:** Views personal attendance calendar, session status history, and compliance percentage.

---

## 2. Database Entities Involved
- `attendance` (Batch ID, Student ID, Class Date, Status: `present`/`absent`/`excused`, Marked By User ID)
- *Database Constraint:* Composite unique index on `(batch_id, student_id, class_date)` preventing duplicate attendance records per session.

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/attendance` | Record or update daily roll call for a batch | `admin`, `instructor` |
| `GET` | `/api/v1/attendance/batch/{id}` | Retrieve historical batch attendance by date | `admin`, `instructor` |
| `GET` | `/api/v1/attendance/my-summary` | Personal attendance totals & percentage compliance | `student` |

---

## 4. Business Rules & Compliance Formulas
$$\text{Attendance Compliance Rate} = \left( \frac{\text{Conducted Sessions with Status 'present'}}{\text{Total Conducted Sessions for Student}} \right) \times 100$$
- Institutional certification threshold requires $\ge 75\%$.
- Submitting attendance for an already recorded date performs an update/audit rather than failing, ensuring smooth correction of mistaken roll-calls.
