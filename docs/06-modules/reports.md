# Module Specification: Reports & Institutional Analytics
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Aggregates operational metrics into role-tailored dashboard telemetry and data export channels:
- **Admin:** Comprehensive KPI overview (students, faculty, courses, active cohorts, collected revenue, pending receivables) and CSV exports.
- **Instructor:** Assigned batch statistics, pending evaluation count, upcoming lecture schedule, and student rosters.
- **Student:** Progress gauge, lecture completion breakdown, pending assignments, and attendance percentage.

---

## 2. Database Entities Involved
Aggregates live operational records across: `users`, `roles`, `courses`, `batches`, `enrollments`, `payments`, `attendance`, `lecture_progress`, `submissions`.

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/reports/dashboard` | Role-tailored KPI telemetry (Admin, Instructor, Student) | Any Authenticated |
| `GET` | `/api/v1/reports/export/enrollments` | Export student enrollment ledger as CSV | `admin` |
| `GET` | `/api/v1/reports/export/revenue` | Export financial payments & receipts ledger as CSV | `admin` |

---

## 4. Analytical Formulas & Zero-Hardcoding Standards
1. **Pending Dues Calculation:**
   $$\text{Pending Dues} = \sum_{\text{Active Enrollments}} \text{Course Fee} - \sum_{\text{Paid Payments}} \text{Amount}$$
2. **Dynamic Chart Streams:** Monthly enrollment and revenue trends structured for seamless consumption by Recharts components.
3. **Data Export Format:** Direct `text/csv` stream with RFC 4180 compliant CSV header and rows.
