# Use Cases and User Stories
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. System Actors
* **Admin (System Administrator):** Full governance over user accounts, institute settings, course catalogue, batch scheduling, financial ledgers, and institutional analytics.
* **Instructor (Faculty / Teacher):** Assigned to courses and batches; manages educational material (lectures, assignments, quizzes), records attendance, and grades submissions.
* **Student (Learner):** Enrolled in batches; consumes lecture materials, completes assignments, attempts timed quizzes, tracks attendance, pays fees, and downloads certificates.
* **Public / Guest:** Unauthenticated visitor who can view published courses, register as a student, and verify student certificates via public verification URL.

---

## 2. Actor Permission Matrix

| Capability | Admin | Instructor | Student | Public |
| :--- | :---: | :---: | :---: | :---: |
| Self-Registration & Login | Yes | Login Only | Yes | Register/Login |
| View Role-Specific Dashboard | Yes | Yes | Yes | No |
| Create & Manage User Accounts | Full | No | No | No |
| Create / Edit Courses & Modules | Full | Assigned Only | No | Read Public |
| Create / Schedule Batches | Full | Assigned Only | View Enrolled | No |
| Upload Lectures & Materials | Full | Assigned Only | Download Permitted | No |
| Create Assignments & Quizzes | Full | Assigned Only | No | No |
| Submit Assignments & Take Quizzes| No | No | Own Enrolled | No |
| Grade Submissions & Publish Scores| Full | Assigned Batches | View Own Feedback | No |
| Record Attendance | Full | Assigned Batches | View Own Record | No |
| View Financials & Collect Fees | Full | No | View Own & Pay | No |
| Download Completion Certificate | No | No | Verified Only | Verify Code |
| Export Audit Reports (CSV/PDF) | Institute-Wide | Batch-Level | Personal Progress | No |

---

## 3. User Stories & Acceptance Criteria

### 3.1 Administrator User Stories

#### US-ADM-01: User & Role Provisioning
* **As an** Administrator  
* **I want to** create, update, search, filter, and deactivate user accounts with specified roles (Admin, Instructor, Student)  
* **So that** only authenticated and authorized personnel can access the LMS.
* **Acceptance Criteria:**
  1. Admin can filter users by role (`admin`, `instructor`, `student`) and status (`active`, `inactive`).
  2. Passwords are never returned in plain text or hash in any response body.
  3. Deactivating a user immediately invalidates their active sessions and prevents further logins.
  4. Email uniqueness is strictly enforced at database and API levels.

#### US-ADM-02: Course & Syllabus Management
* **As an** Administrator  
* **I want to** configure courses with modules, duration, pricing, categories, and Cloudinary thumbnail URLs  
* **So that** the institute can publish educational offerings to students.
* **Acceptance Criteria:**
  1. Courses can be drafted, published, or archived.
  2. Deleting a course with active student enrollments is blocked (returns 409 Conflict with appropriate error message).
  3. Modules are ordered sequentially using a sequence index.

#### US-ADM-03: Batch Allocation & Capacity Guard
* **As an** Administrator  
* **I want to** establish course batches with assigned instructors, calendar schedules, and strict seat limits  
* **So that** classroom sizes remain within pedagogical and operational constraints.
* **Acceptance Criteria:**
  1. Batch start date must precede end date.
  2. Enrolling a student when `enrolled_count >= capacity` throws an HTTP 400 "Batch Capacity Exceeded" error.
  3. Roster shows all enrolled students with payment and attendance summary.

#### US-ADM-04: Financial Oversight & Fee Ledger
* **As an** Administrator  
* **I want to** track fee payments, outstanding balances, and transaction logs across all students  
* **So that** financial reconciliation is accurate and auditable.
* **Acceptance Criteria:**
  1. Fee dashboard computes total revenue collected, total pending dues, and overdue payments.
  2. Admin can manually record offline/cash payments and generate an instant PDF receipt.
  3. Razorpay transactions automatically update student payment status from `pending` to `paid`.

---

### 3.2 Instructor User Stories

#### US-INS-01: Lecture & Media Publishing
* **As an** Instructor  
* **I want to** upload lecture notes (PDFs) and link video lessons to my assigned course modules  
* **So that** my batch students have immediate access to current study materials.
* **Acceptance Criteria:**
  1. Instructors can only upload materials to courses or batches they are assigned to.
  2. File uploads are validated for MIME type (`application/pdf`, `image/*`, `video/mp4`) and maximum size (25MB).
  3. Cloudinary URLs are stored in `study_materials` and linked to lectures.

#### US-INS-02: Assignment Creation & Evaluation
* **As an** Instructor  
* **I want to** create assignments with deadlines and score submitted student deliverables with custom feedback  
* **So that** students receive timely academic evaluations.
* **Acceptance Criteria:**
  1. Submissions past the deadline are flagged as `Late Submission`.
  2. Instructor grading interface displays the submitted document, max marks, and feedback form.
  3. Grading updates the submission status to `Evaluated` and triggers an in-app notification to the student.

#### US-INS-03: Timed Quiz Configuration
* **As an** Instructor  
* **I want to** build timed multiple-choice quizzes with randomized questions and predefined passing marks  
* **So that** student comprehension is tested in a standardized manner.
* **Acceptance Criteria:**
  1. Quiz duration is enforced strictly by the backend timestamp (`submit_time - start_time <= duration_minutes + grace_period`).
  2. Correct options are withheld from the student API response until the attempt is submitted and evaluated.
  3. Scores are calculated server-side.

#### US-INS-04: Batch Attendance Logging
* **As an** Instructor  
* **I want to** mark daily student attendance for my batch sessions in a single roll-call view  
* **So that** attendance rates can be monitored and enforced for certification eligibility.
* **Acceptance Criteria:**
  1. Only one attendance record per student per batch per date is permitted (composite unique constraint).
  2. Instructors can view a historical monthly attendance heat-map/percentage per student.

---

### 3.3 Student User Stories

#### US-STU-01: Course Consumption & Lecture Progress
* **As a** Student  
* **I want to** access lecture videos, download reading materials, and mark lectures completed  
* **So that** I can track my personal progression through the syllabus.
* **Acceptance Criteria:**
  1. Students can only view lecture content for courses in which their enrollment is confirmed (`status = active`).
  2. Clicking "Mark Complete" creates or updates a `lecture_progress` record and recalculates overall course progress.

#### US-STU-02: Assignment Submission
* **As a** Student  
* **I want to** upload my assignment files before the specified deadline and review instructor grades  
* **So that** my coursework is recorded and graded.
* **Acceptance Criteria:**
  1. File upload via Cloudinary stores the remote URL in `submissions`.
  2. Students can view marks awarded and detailed feedback once status is `Evaluated`.

#### US-STU-03: Interactive Timed Quiz Taking
* **As a** Student  
* **I want to** take assigned quizzes within the active availability window with an interactive countdown timer  
* **So that** I can complete my evaluations and view my score immediately.
* **Acceptance Criteria:**
  1. Quiz cannot be started before `window_start` or after `window_end`.
  2. Client-side timer alerts student, and auto-submits upon expiry.
  3. Backend rejects answers submitted after `window_end` or after duration limit.

#### US-STU-04: Online Fee Payment with Razorpay
* **As a** Student  
* **I want to** pay my course tuition fees securely using Razorpay (UPI, Credit/Debit Cards, NetBanking)  
* **So that** my enrollment is activated and I can download a PDF payment receipt.
* **Acceptance Criteria:**
  1. Backend creates a Razorpay Order ID (`rzp.orders.create`).
  2. Frontend opens standard Razorpay Checkout modal.
  3. On success, backend verifies payment signature (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) and marks enrollment active.
  4. An official receipt PDF is generated and accessible on the student portal.

#### US-STU-05: Certificate Download & Public Verification
* **As a** Student  
* **I want to** obtain an official PDF certificate once I achieve >= 80% lecture completion, >= 75% attendance, and pass all required assessments  
* **So that** I have verifiable proof of course completion.
* **Acceptance Criteria:**
  1. Certificate is unlocked only when all business completion rules are satisfied.
  2. Certificate carries a unique verification code (e.g., `LMS-CERT-2026-XXXX`).
  3. Any third party can visit `/verify-certificate/{code}` without logging in to verify recipient authenticity, course name, and issue date.
