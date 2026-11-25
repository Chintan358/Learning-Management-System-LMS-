# Module Specification: Notifications & Announcements
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Delivers asynchronous alerts for academic events and institute-wide communications:
- **Admin:** Publishes general bulletins and cohort announcements targeted by role or batch.
- **Instructor / Student:** Receives real-time alerts for assignments, payments, grades, and schedules.

---

## 2. Database Entities Involved
- `notifications` (User ID, title, message, alert category: `info`/`assignment`/`quiz`/`payment`/`attendance`, target deep link `action_url`, `is_read` boolean flag, timestamp)
- `announcements` (Title, content, target role filter, batch filter, author ID, timestamp)

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/notifications` | Fetch user alerts (supports unread filter) | Any Authenticated |
| `PUT` | `/api/v1/notifications/{id}/read` | Mark individual notification as read | Any Authenticated |
| `GET` | `/api/v1/notifications/announcements` | Retrieve public announcements & batch bulletins | Any Authenticated |
| `POST` | `/api/v1/notifications/announcements` | Post new announcement | `admin` |

---

## 4. Business Rules & Event Triggers
1. **Automated Event Triggers:**
   - On payment verification $\rightarrow$ Payment confirmed notification issued to student.
   - On certificate generation $\rightarrow$ Congratulatory credential notification issued.
   - On submission evaluation $\rightarrow$ Grade available alert issued.
2. **Read State Persistence:** Clicking a notification marks it read in the database, updating the global unread badge counter.
