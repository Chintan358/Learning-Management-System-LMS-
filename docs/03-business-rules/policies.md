# Business Rules & Institutional Policies
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Course Completion & Certification Eligibility Policy

A student is awarded a verified Completion Certificate **only** when all three conditions below are satisfied concurrently:

$$\text{Eligible for Certificate} \iff (\text{Lecture Progress} \ge 80\%) \land (\text{Attendance} \ge 75\%) \land (\text{Quiz Pass Rate} = 100\%)$$

1. **Lecture Consumption:** Student must have marked at least **80%** of total published lectures within the course modules as completed.
2. **Attendance Adherence:** Student must maintain a minimum attendance rate of **75%** across all scheduled batch sessions.
3. **Assessment Passing Criteria:** Student must attempt and achieve at least the passing mark on all mandatory course quizzes and have their submitted assignments evaluated without failing grades.

*Rule Enforcement:* The certificate generation service executes an atomic evaluation query validating all three conditions before issuing a certificate record or generating the PDF.

---

## 2. Attendance Calculation Formula & Policy

$$\text{Attendance Percentage} = \left( \frac{\text{Attended Sessions (Present)}}{\text{Total Eligible Conducted Sessions}} \right) \times 100$$

* **Eligibility Denominator:**
  - Scheduled classes where the instructor marked attendance are counted.
  - Institute-declared holidays, cancelled sessions, and formally approved medical leaves are **excluded** from both numerator and denominator.
* **Duplicate Prevention:**
  - An instructor cannot submit duplicate attendance entries for the same student, batch, and calendar date. Attempting to do so triggers an update/audit trail or is rejected by database unique constraints.
* **Warning Thresholds:**
  - Standard compliance threshold: $\ge 75\%$.
  - Yellow warning alert triggered on student dashboard when attendance drops between $75\%$ and $80\%$.
  - Red critical warning alert triggered when attendance falls below $75\%$.

---

## 3. Assignment Submission & Late Policy

* **Due Date Enforcement:**
  - The assignment `due_date` is stored and compared as a UTC timestamp on the server.
* **Submission Status Matrix:**
  - If $\text{submission\_timestamp} \le \text{due\_date}$, status is set to `submitted`.
  - If $\text{submission\_timestamp} > \text{due\_date}$, status is set to `late` with exact late duration recorded (e.g., "+3 hours late").
  - The instructor grading UI prominently highlights late submissions with an amber badge to allow instructors to apply discretionary or institutional late-penalty deductions.
* **File Upload Constraints:**
  - Accepted formats: `.pdf`, `.zip`, `.docx`, `.png`, `.jpg`.
  - Maximum upload file size: 25 MB.
  - Direct executable files (`.exe`, `.sh`, `.bat`) are blocked by server-side MIME and extension validation.

---

## 4. Timed Quiz & Examination Policy

* **Window & Duration Guard:**
  - A quiz is available only between `window_start` and `window_end`.
  - Once started, the student has exactly `duration_minutes` to complete the quiz.
  - Server-side duration validation provides a 60-second network latency grace period:
    $$\text{Elapsed Time} \le (\text{duration\_minutes} \times 60) + 60 \text{ seconds}$$
  - Answers submitted past the deadline are rejected with HTTP 400 "Quiz submission time expired".
* **Anti-Cheating & Scoring Rules:**
  - The frontend never receives the `is_correct` field in the question payload.
  - Scores are calculated entirely server-side by matching submitted `selected_option_id` against the database correct options.
* **Retake Policy:**
  - By default, `allow_retake = FALSE`. Only one attempt per student per quiz is permitted.
  - If retakes are enabled by the instructor, the highest recorded score is preserved as the final grade.

---

## 5. Batch Capacity & Enrollment Policy

* **Strict Capacity Enforcement:**
  - Each batch has a configured `capacity` (e.g., 30 students).
  - An atomic transaction verifies `current_enrolled_count < capacity` prior to writing a new `batch_students` record.
  - If capacity is reached, new enrollment requests are rejected with an explicit error: `"Batch is full. Please choose an alternate batch schedule."`
* **Schedule Integrity:**
  - A batch `end_date` must strictly follow the `start_date`.

---

## 6. Financial Ledger & Razorpay Payment Policy

* **Fee Collection Model:**
  - Courses define a fixed fee. Enrollments track payment status: `pending`, `partially_paid`, `paid`, or `refunded`.
* **Razorpay Workflow & Security:**
  1. Frontend requests checkout; backend calls Razorpay API to generate a unique `order_id`.
  2. Client completes payment through the official Razorpay Checkout SDK.
  3. Client posts `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to backend.
  4. Backend verifies cryptographic signature:
     $$\text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{key\_secret}) \equiv \text{razorpay\_signature}$$
  5. Upon cryptographic match, enrollment status shifts to `active` and a unique receipt number is generated.
* **Refund Policy:**
  - Refunds are processed exclusively by Administrators with audit logging.
