# Security Architecture & Policy Document
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Authentication & Credential Security
* **Password Hashing:** Passwords are hashed using `passlib` with `bcrypt` (12 rounds) or `Argon2id`. Passwords are never stored or logged in plain text.
* **JWT Token Security:**
  - Standard HMAC-SHA256 signing algorithm.
  - Expiration time: 24 hours (`ACCESS_TOKEN_EXPIRE_MINUTES = 1440`).
  - Payload contains minimal non-sensitive identity claims: `sub` (user_id), `role`, and `exp`.
  - Secret key loaded exclusively from system environment variables (`SECRET_KEY`).
* **Session Deactivation:** Inactive users (`is_active = FALSE`) are rejected during credential validation and blocked during JWT token verification.

---

## 2. Authorization & RBAC Enforcement
* **Server-Side Enforcement:** Every protected route is guarded by FastAPI dependencies:
  - `get_current_user`: Extracts token, decodes payload, and checks account status.
  - `require_role(["admin"])`: Ensures calling user matches the allowed role set, throwing HTTP 403 Forbidden on violation.
* **Resource Ownership Verification:**
  - Students can only view their own submissions, quiz attempts, and payment records (`student_id == current_user.id`).
  - Instructors can only access modules, submissions, and attendance logs for batches assigned to them.

---

## 3. Network, CORS & API Guarding
* **Cross-Origin Resource Sharing (CORS):**
  - Production FastAPI middleware configured to whitelist only the deployed Vercel domain (`ALLOWED_ORIGINS`).
  - Local development whitelists `http://localhost:5173` and `http://localhost:3000`.
* **SQL Injection Prevention:**
  - 100% of database interactions execute through SQLAlchemy parameterized queries and ORM abstractions. Dynamic string concatenation in SQL queries is prohibited.
* **Input Validation & Sanitization:**
  - All input payloads pass through Pydantic v2 schemas validating data types, string length bounds, email format, and numeric thresholds.

---

## 4. Media & File Upload Security
* **Cloudinary Storage Isolation:**
  - File binaries are transferred securely via HTTPS to Cloudinary.
  - MIME-type verification and file extension validation are enforced on the backend prior to storage.
  - Disallowed file types: Executables (`.exe`, `.bat`, `.sh`, `.vbs`, `.bin`), system scripts, or unknown binary streams.
  - Maximum upload file size: 25 MB per file.

---

## 5. Payment Security (Razorpay)
* **Cryptographic Verification:**
  - The backend never trusts client-reported payment success.
  - Receipt of payment triggers server-side signature verification using `razorpay_client.utility.verify_payment_signature(...)`.
* **Secret Protection:**
  - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` reside solely in backend `.env` files and hosting platform secret vaults.
  - Frontend only receives the public `RAZORPAY_KEY_ID` for loading the checkout modal.
* **PCI-DSS Compliance:** Card and bank credentials are never touched, stored, or processed by LMS application servers.

---

## 6. Security Audit Checklist

| Item | Requirement | Implementation Status |
| :--- | :--- | :---: |
| SEC-01 | Passwords hashed with bcrypt / Argon2 | Verified |
| SEC-02 | JWT secret key loaded from environment variable | Verified |
| SEC-03 | Inactive users blocked from login and token usage | Verified |
| SEC-04 | Role permissions enforced at API endpoint level | Verified |
| SEC-05 | Resource isolation (students cannot see peers' marks) | Verified |
| SEC-06 | CORS restricted to authorized frontend origins | Verified |
| SEC-07 | SQL injection mitigated by SQLAlchemy ORM queries | Verified |
| SEC-08 | Payment signatures cryptographically verified via HMAC | Verified |
| SEC-09 | Uploaded files validated for MIME type & size | Verified |
| SEC-10 | Sensitive secrets excluded from Git version control | Verified |
