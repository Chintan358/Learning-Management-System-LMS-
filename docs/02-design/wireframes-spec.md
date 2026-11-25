# Frontend UI/UX Design & Wireframe Specifications
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Design System & Style Guide

### 1.1 Color Palette
* **Primary Brand (Indigo):**
  - Primary Base: `#4F46E5` (`indigo-600`)
  - Primary Hover: `#4338CA` (`indigo-700`)
  - Primary Light: `#EEF2FF` (`indigo-50`)
* **Secondary / Accent (Teal / Cyan):**
  - Accent Base: `#0D9488` (`teal-600`)
  - Accent Light: `#F0FDFA` (`teal-50`)
* **Status Badges & Feedback:**
  - Success: `#10B981` (`emerald-500`) / Background `#ECFDF5` (`emerald-50`)
  - Warning / Pending: `#F59E0B` (`amber-500`) / Background `#FFFBEB` (`amber-50`)
  - Danger / Error / Late: `#EF4444` (`red-500`) / Background `#FEF2F2` (`red-50`)
  - Neutral / Draft: `#6B7280` (`gray-500`) / Background `#F3F4F6` (`gray-100`)
* **Background & Surfaces:**
  - App Background: `#F8FAFC` (`slate-50`)
  - Card & Surface Background: `#FFFFFF`
  - Border Color: `#E2E8F0` (`slate-200`)
  - Primary Text: `#0F172A` (`slate-900`)
  - Secondary Text: `#475569` (`slate-600`)

### 1.2 Typography & Spacing
* **Font Family:** `Inter`, system-ui, sans-serif
* **Scale:**
  - H1: `28px / 36px`, `font-bold`
  - H2: `22px / 28px`, `font-semibold`
  - H3: `18px / 24px`, `font-medium`
  - Body: `14px / 20px`, `font-normal`
  - Small / Badges: `12px / 16px`, `font-medium`
* **Spacing:** 4px grid (`p-2`, `p-4`, `p-6`, `gap-6`).

---

## 2. Layout Architecture
* **Public Layout:** Minimal top navbar with institute logo, course catalogue link, certificate verification link, and login/register buttons.
* **Role-Based Authenticated Layout:**
  - **Collapsible Sidebar (Left):** Dynamic navigation items filtered by authenticated role (`admin`, `instructor`, `student`). Collapses to hamburger drawer on `< 1024px` viewport.
  - **Header (Top):** Page breadcrumbs, global search bar, active batch indicator, notification bell with unread badge counter, and user profile avatar dropdown.
  - **Main Content Area:** Standard padded container (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`) containing breadcrumb, page title, primary CTA, and responsive grid cards/tables.

---

## 3. Screen Specifications (SRS Section 8)

### S01: Authentication (Login / Forgot / Reset Password)
* **Structure:** Centered card with split-screen branding on desktop (`hidden lg:flex w-1/2` with institute gradient and illustrations).
* **Inputs:** Email, Password, "Remember Me" toggle, "Forgot Password?" hyperlink.
* **States:** Live input validation, loading spinner button during API call, banner error message for invalid credentials or deactivated account.

### S02: Admin Dashboard
* **Metrics Row (KPI Cards):** Total Students, Total Instructors, Active Courses, Active Batches, Total Revenue, Pending Dues.
* **Charts Section:**
  - Recharts Area Chart: 6-month enrollment trend.
  - Recharts Bar Chart: Course-wise fee collections vs. pending receivables.
* **Activity & Tables:** Recent student enrollments table, quick actions drawer (Create Batch, Invite Instructor, Publish Announcement).

### S03: Instructor Dashboard
* **Metrics Row:** Assigned Batches, Active Students, Lectures Scheduled This Week, Pending Assignment Evaluations.
* **Evaluation Queue Table:** Student name, assignment title, submission date, status (`Under Review`, `Late`), and "Grade Now" button.
* **Schedule Widget:** Upcoming lecture timetable with direct join/view links.

### S04: Student Dashboard
* **Hero Banner:** Welcome back greeting with aggregate academic progress bar and streak counter.
* **Enrolled Courses Grid:** Progress percentage circle, next lecture title, "Resume Learning" button.
* **Task Tracker:** Upcoming assignment deadlines (color-coded red if < 24 hrs), scheduled quiz alert cards, attendance summary ring.

### S05: Course Listing & Management
* **Admin / Instructor View:** Search bar, category filter, status filter (`All`, `Draft`, `Published`, `Archived`), and "Create Course" modal button.
* **Public / Student View:** Grid of course cards showing Cloudinary thumbnail, title, category pill, duration badge, price tag, and "Enroll Now" CTA.

### S06: Course Details & Curriculum View
* **Syllabus Accordion:** Expandable modules listing lectures, duration, and study materials.
* **Metadata Sidebar:** Instructor bio card, pricing breakdown, prerequisites, and "Enroll / Pay via Razorpay" button.

### S07: Batch Scheduling & Management
* **Batch Table:** Code, Batch Name, Course Name, Instructor, Schedule Timetable, Capacity meter (`18/30 enrolled`), Status badge, Actions menu.
* **Roster Modal:** View list of enrolled students, add student, drop student, export roster to CSV.

### S08: Lecture & Study Material Player
* **Layout:** 70/30 split. Left: Responsive video player frame (or video URL stream) + lecture notes rich text. Right: Module curriculum playlist checklist with checkmarks for completed lessons.
* **Controls:** "Mark as Complete" button, downloadable study material cards (PDF, PPT).

### S09: Assignment Management & Evaluation View
* **Student View:** Assignment details, download starter kit file, drag-and-drop file upload zone, submit button, feedback card with graded rubric.
* **Instructor View:** Tabular submissions list, filter by status, grading modal with inline preview, marks input (`marks / max_marks`), and feedback text area.

### S10: Interactive Quiz & Examination View
* **Pre-Quiz Screen:** Instructions, duration countdown rules, passing score requirement, "Begin Quiz" button.
* **Active Attempt Screen:** Persistent sticky top bar with remaining time countdown timer. Left side: Question number palette (answered = green, unanswered = grey, flagged = amber). Center: Question text, radio buttons for options. Bottom: Next, Previous, "Submit Exam" modal confirmation.
* **Result Screen:** Immediate score tally, pass/fail status banner, and question-by-question breakdown if answers review is permitted.

### S11: Attendance Management View
* **Instructor View:** Date picker (default today), batch selector, roster table with toggle switches (`Present` / `Absent`). "Submit Attendance" updates database.
* **Student View:** Monthly attendance calendar, total attended sessions, total classes held, attendance percentage card with alert if below 75%.

### S12: Payments, Fees & Razorpay Checkout
* **Fee Ledger Table:** Receipt number, course title, total fee, amount paid, balance due, payment date, status badge.
* **Payment Flow:** "Pay Now" button triggers backend order creation, loads Razorpay checkout overlay. Upon verification, receipt card provides "Download PDF Receipt".

### S13: Certificate Generation & Public Verification
* **Student Certificate Page:** High-resolution certificate preview card with student name, course title, completion date, verification ID, and "Download PDF" button.
* **Public Verification Screen (`/verify-certificate/{code}`):** Search by certificate number or scan QR code. Displays verified badge, student name, institute seal, and course credentials.

### S14: Reports & Analytics
* **Filter Bar:** Date range picker, course selector, batch selector.
* **Data Panels:** Enrollment statistics, Financial revenue vs receivables, Attendance adherence report, Quiz passing ratios.
* **Export Actions:** "Export to CSV" and "Export to PDF" buttons.
