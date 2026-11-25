# Student Operating Manual

**Document Version:** `1.0.0`  
**Role:** Enrolled Student (`student`)

---

## 1. Overview & Student Portal Access

The Student Portal provides learners with access to course materials, video lectures, assignment submission, online timed examinations, attendance tracking, tuition fee payments, and verified graduation certificates.

### Account Registration & Login
1. Navigate to the LMS portal URL (`/login`).
2. If you are a new student, click **"Register as Student"** and enter your name, email, password, and phone number.
3. For demo access:
   - **Demo Email:** `student@lms.edu`
   - **Password:** `Student@Secure2026!`
   *(You may click the **"Student Demo"** button on the login screen for quick fill).*
4. Upon authentication, you will be redirected to the **Student Dashboard** (`/student`).

---

## 2. Navigating the Student Dashboard (`/student`)

The Student Dashboard provides an overview of your academic status:
- **Enrolled Courses:** Direct access cards showing current progress percentages.
- **Attendance Rate:** Real-time gauge displaying your attendance compliance against the institutional 75% minimum requirement.
- **Upcoming Deadlines:** Alerts for pending assignments and scheduled quizzes.

---

## 3. Streaming Lectures & Study Materials (`/courses`)

1. Click **My Courses** in the sidebar.
2. Select your enrolled course.
3. In the syllabus tree, click any lecture title to open the **Lecture Player** (`/courses/:courseId/lectures/:lectureId`).
4. **Player Features:**
   - High-definition video playback.
   - Accompanying study notes and downloadable reference attachments.
   - **"Mark as Completed"** button: Click this when you finish the lecture to update your course progress and unlock final certification eligibility.

---

## 4. Submitting Coursework Assignments (`/assignments`)

1. Click **Assignments** in the sidebar.
2. Review the list of assignments, maximum marks, and due dates.
3. Click **"Submit Solution"** on the target assignment.
4. Enter your textual answer or project description.
5. Provide your project attachment URL (e.g., Cloudinary or GitHub link).
6. Click **"Submit Assignment"**.
   *(Note: Submissions made past the scheduled deadline will be flagged as **Late Submission** according to institutional policy).*
7. Once your instructor evaluates your work, your score and qualitative feedback will appear in your assignment card.

---

## 5. Taking Timed MCQ Quizzes (`/quizzes`)

1. Click **Quizzes** in the sidebar.
2. Select an active quiz.
3. Review the pre-exam instructions: time limit (e.g., 30 minutes), number of questions, and passing score percentage.
4. Click **"Start Timed Exam"**.
5. **Exam Screen Features:**
   - **Countdown Timer:** Live header counter warning you of remaining time.
   - **Question Navigator Palette:** Jump directly to any question; questions turn indigo once answered.
   - **Auto-Submission:** If the timer reaches 00:00, your current answers are automatically submitted.
6. Click **"Submit Exam"** when finished.
7. Your exam is immediately scored server-side, displaying your marks, percentage, and Pass / Fail accreditation.

---

## 6. Monitoring Attendance Compliance (`/attendance`)

1. Click **Attendance** in the sidebar.
2. Review your total sessions, present count, absent count, and overall **Compliance Rate**.
3. **Institutional Threshold:** If your compliance falls below **75%**, an amber warning alert is displayed reminding you that 75% attendance is required to qualify for final certification.

---

## 7. Tuition Fees & Razorpay Payments (`/payments`)

1. Click **Tuition & Fees** in the sidebar.
2. Review your financial breakdown: Total Course Fees, Amount Paid, and Balance Due.
3. **Paying Fees via Razorpay:**
   - If you have an outstanding balance, enter the amount you wish to pay.
   - Click **"Pay with Razorpay"**.
   - The secure Razorpay modal opens supporting **UPI** (Google Pay, PhonePe, Paytm), **Credit/Debit Cards**, and **Net Banking**.
   - Upon payment completion, the transaction signature is verified by the server, updating your balance to ₹0.
4. **Official Receipts:**
   - Click **"View Receipt"** next to any completed transaction.
   - Click **"Print Receipt"** to print or save an official institutional fee receipt for your records.

---

## 8. Graduation Certificates & Public Verification (`/certificates`)

1. Click **Certificates** in the sidebar.
2. To request a graduation certificate for a completed course, you must meet all 5 institutional criteria:
   - 100% lectures completed
   - $\ge 75\%$ batch attendance
   - $\ge 50\%$ assignment marks average
   - $\ge 50\%$ quiz examination score
   - Zero outstanding tuition fee balance
3. Click **"Evaluate & Generate"**. The server compiles your tamper-evident ReportLab PDF certificate.
4. **Downloading & Sharing:**
   - Click **"Download PDF"** to obtain your high-resolution accredited diploma.
   - Click **"Copy Link"** to share your public verification URL (`/verify-certificate/CERT-...`).
   - Anyone (including prospective employers) can visit the public verification portal without logging in to verify the authenticity and issue date of your credential.
