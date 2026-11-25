# Comprehensive Data Dictionary
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

This dictionary details the complete 24-table database schema designed for the Learning Management System (LMS), implemented via SQLAlchemy 2.0 and targeted for MySQL 8.0+.

---

### Table 1: `roles`
*Purpose:* Master lookup table for user roles.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Role ID |
| `name` | VARCHAR(50) | No | Unique | Role name: `admin`, `instructor`, `student` |
| `description`| VARCHAR(255) | Yes | | High-level role scope description |

---

### Table 2: `users`
*Purpose:* Authentication and unified profile for all system actors.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique User ID |
| `role_id` | INT | No | FK -> `roles.id` | Associated role |
| `first_name` | VARCHAR(100) | No | | User's given name |
| `last_name` | VARCHAR(100) | No | | User's family/surname |
| `email` | VARCHAR(150) | No | Unique, Indexed | Validated login email |
| `hashed_password` | VARCHAR(255) | No | | bcrypt/Argon2 password hash |
| `phone` | VARCHAR(20) | Yes | | Contact phone number |
| `avatar_url` | VARCHAR(500) | Yes | | Cloudinary hosted avatar image URL |
| `is_active` | BOOLEAN | No | Default TRUE | Account active/deactivated flag |
| `created_at` | DATETIME | No | Default CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | DATETIME | No | On Update CURRENT_TIMESTAMP | Record modification timestamp |

---

### Table 3: `instructors`
*Purpose:* Extended academic profile for faculty members.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Instructor Profile ID |
| `user_id` | INT | No | FK -> `users.id` (1:1), Unique | Linked user entity |
| `bio` | TEXT | Yes | | Professional biography |
| `qualification` | VARCHAR(255) | Yes | | Degrees, certifications, credentials |
| `specialization`| VARCHAR(255) | Yes | | Primary teaching subjects/domains |
| `experience_years`| INT | Yes | Default 0 | Years of professional experience |

---

### Table 4: `courses`
*Purpose:* Academic course catalogue offering.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Course ID |
| `course_code`| VARCHAR(50) | No | Unique, Indexed | Short code (e.g. `CS-101`) |
| `title` | VARCHAR(200) | No | Indexed | Course title |
| `description`| TEXT | Yes | | Comprehensive syllabus description |
| `category` | VARCHAR(100) | No | Indexed | e.g. Web Dev, Data Science |
| `duration_weeks`| INT | No | Default 4 | Duration in weeks |
| `fee` | DECIMAL(10,2)| No | Default 0.00 | Course tuition fee in INR/USD |
| `thumbnail_url`| VARCHAR(500)| Yes | | Cloudinary thumbnail URL |
| `status` | ENUM | No | Default 'draft' | `draft`, `published`, `archived` |
| `created_at` | DATETIME | No | Default CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | DATETIME | No | On Update CURRENT_TIMESTAMP | Last modified timestamp |

---

### Table 5: `course_modules`
*Purpose:* Hierarchical chapters within a course.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Module ID |
| `course_id` | INT | No | FK -> `courses.id`, Cascade | Parent course |
| `title` | VARCHAR(200) | No | | Chapter/module title |
| `description`| TEXT | Yes | | Brief overview of topics covered |
| `order_index`| INT | No | Default 1 | Display sequence order |

---

### Table 6: `batches`
*Purpose:* Cohort schedule for students enrolled in a course.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Batch ID |
| `batch_code` | VARCHAR(50) | No | Unique, Indexed | Code (e.g. `BATCH-2026-WD01`) |
| `name` | VARCHAR(150) | No | | Friendly batch name |
| `course_id` | INT | No | FK -> `courses.id` | Target course |
| `instructor_id`| INT | Yes | FK -> `users.id` | Assigned instructor user ID |
| `start_date` | DATE | No | | Batch commencement date |
| `end_date` | DATE | No | | Scheduled completion date |
| `schedule_timing`| VARCHAR(100)| Yes | | e.g., "Mon-Wed-Fri 10:00 - 12:00" |
| `capacity` | INT | No | Default 30 | Maximum student seating capacity |
| `status` | ENUM | No | Default 'upcoming' | `upcoming`, `active`, `completed`, `cancelled` |

---

### Table 7: `batch_students`
*Purpose:* Many-to-many allocation of students into batches.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Mapping ID |
| `batch_id` | INT | No | FK -> `batches.id` | Target batch |
| `student_id` | INT | No | FK -> `users.id` | Enrolled student |
| `joined_at` | DATETIME | No | Default CURRENT_TIMESTAMP | Enrollment date |
| *Constraint* | UNIQUE | No | `(batch_id, student_id)` | Prevents duplicate student in same batch |

---

### Table 8: `enrollments`
*Purpose:* Academic registration linking student, course, and payment status.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Enrollment ID |
| `student_id` | INT | No | FK -> `users.id` | Student recipient |
| `course_id` | INT | No | FK -> `courses.id` | Target course |
| `batch_id` | INT | Yes | FK -> `batches.id` | Assigned cohort |
| `enrollment_date`| DATETIME | No | Default CURRENT_TIMESTAMP | Date of registration |
| `status` | ENUM | No | Default 'pending' | `pending`, `active`, `completed`, `cancelled` |

---

### Table 9: `lectures`
*Purpose:* Individual lesson content within a module.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Lecture ID |
| `module_id` | INT | No | FK -> `course_modules.id` | Parent module |
| `title` | VARCHAR(200) | No | | Lesson title |
| `description`| TEXT | Yes | | Detailed summary / transcript |
| `video_url` | VARCHAR(500) | Yes | | Cloudinary or embed stream URL |
| `duration_mins`| INT | No | Default 0 | Estimated duration in minutes |
| `sequence` | INT | No | Default 1 | Playback order |

---

### Table 10: `study_materials`
*Purpose:* Downloadable attachments (PDF, slides, source files) for a lecture.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Material ID |
| `lecture_id` | INT | No | FK -> `lectures.id`, Cascade | Linked lecture |
| `title` | VARCHAR(200) | No | | Document display title |
| `file_url` | VARCHAR(500) | No | | Cloudinary hosted file URL |
| `file_type` | VARCHAR(50) | No | | MIME type (`pdf`, `pptx`, `zip`) |
| `file_size_kb`| INT | Yes | | File size in kilobytes |

---

### Table 11: `assignments`
*Purpose:* Coursework issued to a batch or course.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Assignment ID |
| `batch_id` | INT | No | FK -> `batches.id` | Target batch |
| `title` | VARCHAR(200) | No | | Assignment title |
| `description`| TEXT | No | | Assignment instructions |
| `attachment_url`| VARCHAR(500)| Yes | | Cloudinary reference brief/starter file |
| `max_marks` | INT | No | Default 100 | Maximum possible points |
| `due_date` | DATETIME | No | | Strict submission deadline |
| `created_by` | INT | No | FK -> `users.id` | Authoring instructor |

---

### Table 12: `submissions`
*Purpose:* Student deliverables submitted against an assignment.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Submission ID |
| `assignment_id`| INT | No | FK -> `assignments.id` | Target assignment |
| `student_id` | INT | No | FK -> `users.id` | Submitting student |
| `file_url` | VARCHAR(500) | No | | Cloudinary URL of student file |
| `submitted_at`| DATETIME | No | Default CURRENT_TIMESTAMP | Submission timestamp |
| `is_late` | BOOLEAN | No | Default FALSE | Computed flag: `submitted_at > due_date` |
| `status` | ENUM | No | Default 'submitted' | `submitted`, `late`, `evaluated` |

---

### Table 13: `assignment_feedback`
*Purpose:* Instructor evaluation and score for a submission.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Feedback ID |
| `submission_id`| INT | No | FK -> `submissions.id` (1:1), Cascade | Associated student deliverable |
| `evaluated_by`| INT | No | FK -> `users.id` | Grading instructor |
| `marks_awarded`| DECIMAL(5,2)| No | | Score achieved |
| `feedback` | TEXT | Yes | | Qualitative review commentary |
| `evaluated_at`| DATETIME | No | Default CURRENT_TIMESTAMP | Timestamp of evaluation |

---

### Table 14: `quizzes`
*Purpose:* Timed multiple choice evaluations for a batch.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Quiz ID |
| `batch_id` | INT | No | FK -> `batches.id` | Target batch |
| `title` | VARCHAR(200) | No | | Quiz title |
| `duration_mins`| INT | No | Default 30 | Countdown limit in minutes |
| `total_marks`| INT | No | Default 100 | Aggregate points |
| `passing_marks`| INT | No | Default 50 | Passing threshold |
| `window_start`| DATETIME | No | | Availability start time |
| `window_end` | DATETIME | No | | Availability deadline |
| `allow_retake`| BOOLEAN | No | Default FALSE | Whether retakes are permitted |

---

### Table 15: `questions`
*Purpose:* Questions linked to a quiz.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Question ID |
| `quiz_id` | INT | No | FK -> `quizzes.id`, Cascade | Parent quiz |
| `question_text`| TEXT | No | | Prompt text |
| `marks` | INT | No | Default 1 | Weight for this question |

---

### Table 16: `quiz_options`
*Purpose:* Multiple choice options per question.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Option ID |
| `question_id`| INT | No | FK -> `questions.id`, Cascade | Parent question |
| `option_text`| TEXT | No | | Text of answer choice |
| `is_correct` | BOOLEAN | No | Default FALSE | Truth flag (withheld from student test payload) |

---

### Table 17: `quiz_attempts`
*Purpose:* Student assessment session and overall score.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Attempt ID |
| `quiz_id` | INT | No | FK -> `quizzes.id` | Target quiz |
| `student_id` | INT | No | FK -> `users.id` | Examinee |
| `started_at` | DATETIME | No | Default CURRENT_TIMESTAMP | Server-recorded start |
| `submitted_at`| DATETIME | Yes | | Server-recorded completion |
| `score` | DECIMAL(5,2)| Yes | | Computed total score |
| `is_passed` | BOOLEAN | Yes | | `score >= passing_marks` |
| `status` | ENUM | No | Default 'in_progress' | `in_progress`, `completed`, `timed_out` |

---

### Table 18: `quiz_answers`
*Purpose:* Individual option chosen per question during a quiz attempt.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Answer ID |
| `attempt_id` | INT | No | FK -> `quiz_attempts.id`, Cascade | Linked session |
| `question_id`| INT | No | FK -> `questions.id` | Target question |
| `selected_option_id`| INT | Yes | FK -> `quiz_options.id` | Chosen answer |
| `is_correct` | BOOLEAN | No | Default FALSE | Server evaluated correctness |
| `marks_awarded`| DECIMAL(5,2)| No | Default 0.00 | Points assigned |

---

### Table 19: `attendance`
*Purpose:* Daily batch attendance ledger.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Record ID |
| `batch_id` | INT | No | FK -> `batches.id` | Session cohort |
| `student_id` | INT | No | FK -> `users.id` | Learner |
| `class_date` | DATE | No | Indexed | Date of session |
| `status` | ENUM | No | Default 'present' | `present`, `absent`, `excused` |
| `marked_by` | INT | No | FK -> `users.id` | Faculty member |
| *Constraint* | UNIQUE | No | `(batch_id, student_id, class_date)` | Prevents duplicate mark per day |

---

### Table 20: `lecture_progress`
*Purpose:* Granular student video/lecture completion records.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Progress ID |
| `student_id` | INT | No | FK -> `users.id` | Enrolled learner |
| `lecture_id` | INT | No | FK -> `lectures.id`, Cascade | Completed lecture |
| `is_completed`| BOOLEAN | No | Default TRUE | Completion indicator |
| `completed_at`| DATETIME | No | Default CURRENT_TIMESTAMP | Timestamp marked |
| *Constraint* | UNIQUE | No | `(student_id, lecture_id)` | Prevents duplicate progress |

---

### Table 21: `certificates`
*Purpose:* Official completion credentials issued to qualifying students.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Certificate ID |
| `certificate_number`| VARCHAR(100)| No | Unique, Indexed | Formatted ID (e.g. `CERT-2026-A9F4E`) |
| `student_id` | INT | No | FK -> `users.id` | Recipient student |
| `course_id` | INT | No | FK -> `courses.id` | Certified course |
| `issue_date` | DATE | No | | Official issuance date |
| `pdf_url` | VARCHAR(500)| Yes | | Cloudinary hosted certificate PDF |
| `verification_code`| VARCHAR(64)| No | Unique, Indexed | Cryptographic verification hash |

---

### Table 22: `payments`
*Purpose:* Financial ledger tracking tuition invoices and Razorpay transactions.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Payment ID |
| `receipt_number`| VARCHAR(100)| No | Unique, Indexed | Internal invoice/receipt number |
| `student_id` | INT | No | FK -> `users.id` | Payer student |
| `course_id` | INT | No | FK -> `courses.id` | Associated course |
| `amount` | DECIMAL(10,2)| No | | Payment amount in INR/USD |
| `currency` | VARCHAR(10) | No | Default 'INR' | Currency code |
| `payment_method`| VARCHAR(50) | No | Default 'razorpay' | `razorpay`, `cash`, `bank_transfer` |
| `razorpay_order_id`| VARCHAR(100)| Yes | Indexed | Razorpay order identifier |
| `razorpay_payment_id`| VARCHAR(100)| Yes | Indexed | Razorpay transaction identifier |
| `razorpay_signature`| VARCHAR(255)| Yes | | HMAC-SHA256 signature token |
| `status` | ENUM | No | Default 'pending' | `paid`, `partially_paid`, `pending`, `failed`, `refunded` |
| `payment_date`| DATETIME | Yes | | Timestamp of successful payment |

---

### Table 23: `notifications`
*Purpose:* Real-time, in-app event notifications for users.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Alert ID |
| `user_id` | INT | No | FK -> `users.id`, Cascade | Targeted recipient |
| `title` | VARCHAR(200) | No | | Alert subject line |
| `message` | TEXT | No | | Notification body |
| `type` | VARCHAR(50) | No | Default 'info' | `info`, `assignment`, `quiz`, `payment`, `attendance` |
| `action_url` | VARCHAR(255) | Yes | | Deep-link target route |
| `is_read` | BOOLEAN | No | Default FALSE, Indexed | Read/unread flag |
| `created_at` | DATETIME | No | Default CURRENT_TIMESTAMP | Broadcast timestamp |

---

### Table 24: `announcements`
*Purpose:* Institute-wide or batch-specific public bulletins.
| Column | Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | INT | No | PK, Auto Increment | Unique Announcement ID |
| `title` | VARCHAR(200) | No | | Announcement headline |
| `content` | TEXT | No | | Bulletin body text |
| `target_role`| VARCHAR(50) | Yes | | Null (all), or specific role |
| `batch_id` | INT | Yes | FK -> `batches.id` | Null (institute-wide) or specific batch |
| `created_by` | INT | No | FK -> `users.id` | Authoring administrator |
| `created_at` | DATETIME | No | Default CURRENT_TIMESTAMP | Post timestamp |
