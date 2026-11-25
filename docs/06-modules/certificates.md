# Module Specification: Certificate Generation & Public Verification
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Enforces academic completion criteria and issues tamper-evident completion certificates with public verification:
- **Student:** Requests certificate generation upon completing course milestones and downloads official PDF credentials.
- **Public / Employer:** Verifies student certificate authenticity using the unique certificate number or verification hash without requiring login credentials.

---

## 2. Database Entities Involved
- `certificates` (Certificate number, student ID, course ID, issue date, Cloudinary PDF URL, verification code)
- Evaluated dependencies: `lecture_progress`, `attendance`, `quiz_attempts`

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/certificates/generate` | Validate criteria & generate PDF certificate | `student` |
| `GET` | `/api/v1/certificates/my-certificates` | Retrieve student's earned certificates | `student` |
| `GET` | `/api/v1/certificates/verify/{code}` | **Public verification** by certificate ID or hash | **Public (No Auth)** |

---

## 4. Eligibility Rules & Tamper-Proof Cryptography
1. **Three-Way Eligibility Rule:**
   - $\ge 80\%$ of published lectures marked complete.
   - $\ge 75\%$ session attendance compliance.
   - $100\%$ of course quizzes attempted and passed.
2. **Cryptographic Verification Hash:**
   $$\text{Verification Code} = \text{SHA256}(\text{student\_id} + ":" + \text{course\_id} + ":" + \text{cert\_number} + ":" + \text{issue\_date})$$
3. **ReportLab PDF Rendering:** In-memory generation of high-resolution landscape certificate featuring institute seal, student name, course title, and verification hash.
