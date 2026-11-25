# Module Specification: Timed MCQ Examination Engine
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Manages timed multiple choice assessments, prevents question tampering, and enforces server-side score calculation:
- **Instructor / Admin:** Authors timed quizzes, configures passing thresholds, sets availability windows, and views attempt analytics.
- **Student:** Initiates timed attempt sessions within the open window, navigates questions, and submits answers before duration expires.

---

## 2. Database Entities Involved
- `quizzes` (Batch link, title, duration in minutes, total marks, passing marks, availability window, retake policy)
- `questions` (Prompt text, question points)
- `quiz_options` (Option text, `is_correct` boolean)
- `quiz_attempts` (Attempt session, started timestamp, submitted timestamp, final score, `is_passed` flag, status)
- `quiz_answers` (Per-question answer record, selected option ID, marks awarded)

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/quizzes` | List batch quizzes with question counts | Any Batch Member |
| `POST` | `/api/v1/quizzes` | Create quiz with questions and MCQ choices | `admin`, `instructor` |
| `POST` | `/api/v1/quizzes/{id}/start` | Start timed attempt session & fetch question paper | `student` |
| `POST` | `/api/v1/quizzes/{id}/submit`| Submit answers for server-side evaluation | `student` |

---

## 4. Anti-Cheating & Security Guardrails
1. **Withheld Correct Options:** The API response for `/start` strictly excludes the `is_correct` field from all options sent to the client.
2. **Server-Side Scoring:** Answers are evaluated purely on the backend by matching submitted `selected_option_id` against the database correct options. Client-submitted score values are never trusted or accepted.
3. **Strict Countdown Enforcement:** The server verifies elapsed time between `started_at` and `submitted_at`:
   $$\text{Elapsed Time} \le (\text{duration\_mins} \times 60) + 60\text{ seconds grace period}$$
   Exceeding this window marks the attempt as `timed_out`.
4. **Retake Guard:** If `allow_retake == False`, subsequent attempt initialization requests are blocked with HTTP 400 Bad Request.
