# Administrator Operating Manual

**Document Version:** `1.0.0`  
**Role:** Institutional Administrator (`admin`)

---

## 1. Overview & Administrator Portal Access

The Institutional Administrator possesses complete administrative oversight across all courses, batches, academic users, financial audits, and system configuration.

### Logging In
1. Navigate to the LMS portal URL (`/login`).
2. Enter your institutional administrator credentials:
   - **Demo Email:** `admin@lms.edu`
   - **Password:** `Admin@Secure2026!`
   *(You may click the **"Admin Demo"** pill on the login screen for quick fill).*
3. Upon authentication, you will be redirected to the **Admin Dashboard** (`/admin`).

---

## 2. Managing the Admin Dashboard (`/admin`)

The Admin Dashboard provides real-time oversight of institutional operations:
- **KPI Counters:** Live metrics for Total Active Students, Active Batches, Published Courses, and Total Tuition Revenue Collected.
- **Revenue & Enrollment Trends:** Interactive Recharts visualising monthly admissions trajectories and revenue realization.
- **Recent Registrations:** Live feed of incoming student enrollments.

---

## 3. User & Staff Management (`/admin/users`)

Administrators have exclusive permissions to provision accounts and assign roles:

### Provisioning a New User
1. Click **Users & Staff** in the sidebar.
2. Click the **"Provision New User"** button in the top right.
3. Complete the modal form:
   - First Name & Last Name
   - Email Address (e.g., `dr.smith@lms.edu`)
   - Temporary Password (minimum 6 characters)
   - Role Type (`Instructor`, `Student`, or `Administrator`)
   - Phone Number (optional)
4. Click **"Create Account"**. The user is immediately provisioned and can log in.

### Deactivating or Modifying User Accounts
- **Toggle Active Status:** Click the **"Active" / "Inactive"** pill on any row to immediately enable or suspend account access.
- **Edit Details:** Click the pencil icon to update contact information or reset passwords.
- **Deactivate User:** Click the trash icon to confirm account suspension.

---

## 4. Course Syllabus & Publishing (`/courses`)

### Creating a Course
1. Navigate to **Courses** from the sidebar.
2. Click **"Create New Course"**.
3. Fill in the course specifications:
   - Course Code (e.g., `CS204`)
   - Course Title & Category (e.g., `Programming`, `Cloud`, `Design`)
   - Duration in Weeks
   - Tuition Fee (in INR ₹)
   - Status (`Published` or `Draft`)
4. Click **"Publish Course"**.

### Adding Curriculum Modules
1. Click on the newly created course card to open the **Course Detail** view (`/courses/:id`).
2. Click **"Add Module"** to organize the curriculum into weekly modules or units.

---

## 5. Batch Scheduling & Capacity Management (`/batches`)

### Creating a Scheduled Batch
1. Navigate to **Batches** in the sidebar.
2. Click **"Create New Batch"**.
3. Specify:
   - Batch Name (e.g., `Batch Spring 2026 - Morning`)
   - Associated Course
   - Assigned Instructor
   - Maximum Student Capacity (e.g., `30` seats)
   - Start Date & End Date
   - Schedule Timetable (e.g., `Mon, Wed, Fri 09:00 - 11:00 IST`)
4. Click **"Create Batch"**.

### Allocating Students to a Batch
1. On the batch card, click **"Manage Roster"**.
2. Select a registered student from the dropdown.
3. Click **"Allocate Student"**. The platform automatically tracks remaining seat capacity and enforces the maximum limit.

---

## 6. Financial Ledger & Fee Auditing (`/payments`)

1. Click **All Payments** in the sidebar.
2. Review all institutional transactions across students.
3. Search by Transaction ID, student email, or payment method (`razorpay`, `bank_transfer`, `cash`).
4. Click **"Export Revenue CSV"** in the top bar to stream a full financial audit ledger for accounting records.

---

## 7. Reports & CSV Exports (`/admin/reports`)

1. Click **Reports & Analytics** in the sidebar.
2. Click **"Export Enrollments CSV"** for complete student registration records.
3. Click **"Export Revenue CSV"** for historical tuition revenue breakdowns.
