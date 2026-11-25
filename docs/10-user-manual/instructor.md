# Instructor Operating Manual

**Document Version:** `1.0.0`  
**Role:** Academic Instructor (`instructor`)

---

## 1. Overview & Instructor Portal Access

The Instructor portal enables academic faculty to manage scheduled batches, upload lecture notes and study media, configure timed quizzes, evaluate student assignments, and conduct batch roll-call attendance.

### Logging In
1. Navigate to the LMS portal URL (`/login`).
2. Enter your instructor credentials:
   - **Demo Email:** `instructor@lms.edu`
   - **Password:** `Instructor@Secure2026!`
   *(You may click the **"Instructor Demo"** button on the login screen for quick fill).*
3. Upon authentication, you will be redirected to the **Instructor Dashboard** (`/instructor`).

---

## 2. Managing the Instructor Dashboard (`/instructor`)

The Instructor Dashboard displays:
- **Assigned Batches:** Cards detailing each active cohort, schedule, and enrolled student count.
- **Weekly Schedule:** Timetable breakdown of upcoming class sessions.
- **Pending Grading Queue:** Immediate visual count of student assignment submissions awaiting evaluation.

---

## 3. Lectures & Study Materials (`/courses`)

### Uploading a New Lecture
1. Navigate to **Course Syllabus** in the sidebar.
2. Select your course and open the **Course Detail** page.
3. In the relevant module section, click **"Add Lecture"**.
4. Enter:
   - Lecture Title
   - Video URL (Cloudinary streaming link or YouTube embed)
   - Duration in minutes
   - Lesson study notes & download references
   - Free preview toggle (for prospective students)
5. Click **"Save Lecture"**.

---

## 4. Coursework Assignments & Evaluation (`/assignments`)

### Creating an Assignment
1. Click **Assignments** in the sidebar.
2. Click **"Create Assignment"**.
3. Specify:
   - Associated Course
   - Title & Detailed Assignment Description
   - Maximum Marks (e.g., `50` or `100`)
   - Submission Deadline (Date & Time)
4. Click **"Publish Assignment"**.

### Grading Student Submissions
1. In the **Assignments** dashboard, click **"Review Submissions"** on the target assignment card.
2. Review the student's solution text and download their uploaded project files.
3. Click **"Grade Submission"**.
4. Enter:
   - Marks Obtained (must not exceed maximum marks)
   - Qualitative Feedback (constructive commentary for student improvement)
5. Click **"Submit Evaluation"**. The student is immediately notified and their gradebook is updated.

---

## 5. Timed MCQ Quizzes (`/quizzes`)

### Creating a Timed Quiz
1. Click **Quizzes** in the sidebar.
2. Click **"Create New Quiz"**.
3. Set the exam parameters:
   - Quiz Title
   - Target Course
   - Time Limit (in minutes, e.g., `30`)
   - Passing Score Percentage (e.g., `50%`)
4. Add Multiple-Choice Questions:
   - Question Stem Text
   - Option A, Option B, Option C, Option D
   - Designate the Correct Option (`A`, `B`, `C`, or `D`)
   *(Note: Correct answers are strictly encrypted on the server and are never sent to students during exam sessions).*
5. Click **"Publish Quiz"**.

---

## 6. Batch Attendance & Roll Call (`/attendance`)

### Conducting a Daily Roll Call
1. Click **Attendance** in the sidebar.
2. Select the **Target Batch** from the dropdown.
3. Select the **Class Date** (defaults to today).
4. For each enrolled student in the roster, click their status toggle:
   - `Present` (Emerald)
   - `Absent` (Red)
   - `Late` (Amber)
   - `Excused` (Blue)
   *(Use **"Mark All Present"** for one-click bulk attendance).*
5. Add optional notes or remarks per student if needed.
6. Click **"Save Roll Call"**. The system updates student compliance rates and checks against the institutional 75% graduation threshold.
