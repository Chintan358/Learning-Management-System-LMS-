# Technical Viva Voce & Project Defense Preparation Guide

**Project Title:** Multi-Role Enterprise Learning Management System (LMS)  
**Target Audience:** Academic Examiners, Senior Technical Interviewers, Project Defense Committee  
**Version:** 1.0.0

---

## 1. System Architecture & High-Level Design Questions

### Q1: Why did you choose FastAPI over traditional Python web frameworks like Django or Flask?
**Model Answer:**
> "We selected FastAPI because of three decisive technical advantages:
> 1. **High Concurrency & Asynchronous I/O:** FastAPI is built on Starlette and ASGI (Asynchronous Server Gateway Interface), allowing it to handle concurrent I/O operations (such as streaming video progress, database queries, and payment webhooks) with throughput comparable to Node.js and Go.
> 2. **Automatic Data Validation & Serialization:** By utilizing Pydantic v2, request bodies, query parameters, and response schemas are strictly validated and serialized at native C-speed with automated HTTP 422 error generation.
> 3. **Clean Architecture & OpenAPI Standards:** FastAPI natively auto-generates interactive OpenAPI v3 / Swagger documentation (`/docs`), ensuring standard contract compliance for frontend team consumption."

### Q2: Why is the application architected with a decoupled frontend (Vercel) and backend (Render)?
**Model Answer:**
> "Decoupling the frontend (Vercel Edge SPA) from the backend API (Render Web Service) establishes a modern microservices-aligned architecture:
> 1. **Independent Scaling:** The frontend consists of static pre-compiled assets distributed across Vercel's global Content Delivery Network (Edge), guaranteeing sub-50ms Time To First Byte (TTFB) anywhere in the world without loading the backend server.
> 2. **Separation of Concerns:** The backend functions purely as a stateless REST API, allowing the database and worker processes to scale horizontally on Render independently of UI bundle deployments.
> 3. **Fault Tolerance:** If the backend experiences temporary maintenance or scaling events, the frontend continues serving user interfaces, displaying graceful offline or retry states."

---

## 2. Database Design & Normalization Questions

### Q3: How is the database normalized, and how did you prevent data anomalies?
**Model Answer:**
> "The database is normalized to Third Normal Form (3NF) across 24 distinct relational entities:
> - **Elimination of Transitive Dependencies:** User attributes (`first_name`, `email`, `password`) are segregated from Role attributes (`name`, `description`) via a foreign key `role_id` referencing a lookup table `roles`.
> - **Many-to-Many Resolution via Junction Tables:**
>   - The relationship between `batches` and `students` is resolved through `batch_students`, storing enrollment metadata (`enrolled_at`, `status`).
>   - Course progress is tracked through `lecture_progress`, decoupling lectures from student identity.
> - **Composite Unique Constraints:** To prevent data anomalies (such as an instructor submitting duplicate attendance entries for the same student on the same date), the `attendance` table enforces a composite unique constraint on `(batch_id, student_id, class_date)`."

### Q4: Why did you use Decimal types instead of Float for fees and grades?
**Model Answer:**
> "Floating-point numbers in computer systems use binary representation (IEEE 754), which causes precision loss during fractional arithmetic (e.g., `0.1 + 0.2 = 0.30000000000000004`). In a financial ledger handling tuition fees and Razorpay transactions, floating-point rounding errors lead to accounting discrepancies. Therefore, we strictly utilized SQLAlchemy `Numeric(10, 2)` mapped to Python's `decimal.Decimal` to ensure exact fixed-point financial precision."

---

## 3. Security, Authentication & Cryptography Questions

### Q5: How does your authentication system prevent unauthorized access across roles?
**Model Answer:**
> "We implement defense-in-depth security:
> 1. **Bcrypt Hashing:** Passwords are never stored in plaintext. They are salted and hashed using Bcrypt with a work factor of 12.
> 2. **Stateless JWT Tokens (RFC 7519):** Upon login, the backend issues an HS256-signed JSON Web Token containing the user's ID as the `sub` claim and their role name in the payload.
> 3. **FastAPI Dependency Injection (`require_role`):** Endpoints enforce role checks at the controller level using reusable dependencies:
>    ```python
>    current_user: User = Depends(require_role(["admin", "instructor"]))
>    ```
>    Even if an attacker modifies client-side JavaScript or local storage, the backend rejects unauthorized API calls with HTTP 403 Forbidden."

### Q6: How does the platform securely verify Razorpay payments and prevent forgery?
**Model Answer:**
> "Payment verification is never trusted from the client. When Razorpay completes a transaction, it returns three artifacts: `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
> - The server computes an HMAC-SHA256 hash using the secret merchant key:
>   $$\text{generated\_signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{secret\_key})$$
> - We compare the generated signature against Razorpay's signature using `hmac.compare_digest()`. This constant-time comparison prevents timing side-channel attacks where an attacker deduces characters based on execution duration."

---

## 4. Academic Business Rules & Anti-Cheating Questions

### Q7: How does the quiz engine prevent cheating on multiple-choice examinations?
**Model Answer:**
> "We enforce three distinct anti-cheating mechanisms:
> 1. **Answer Masking in API Payloads:** When a student fetches `/api/v1/quizzes/{id}`, the backend serialization schema strictly strips out the `is_correct` boolean field and answer keys from all question options. Inspecting network payloads or browser dev tools yields zero examination answers.
> 2. **Server-Side Scoring:** Answers are evaluated purely on the server upon submission by cross-referencing against the database.
> 3. **Retake Prevention:** When a student submits a quiz, the system records a `QuizAttempt`. Subsequent attempts on non-retake quizzes are rejected with HTTP 400 Bad Request."

### Q8: What is the institutional graduation formula for certificate issuance?
**Model Answer:**
> "Certificate generation (`POST /api/v1/certificates/generate`) is governed by an automated eligibility verification algorithm evaluating 5 mandatory conditions:
> 1. **Lecture Completion:** 100% of all lectures in the course syllabus must be marked complete.
> 2. **Attendance Compliance:** Batch attendance must be $\ge 75\%$.
> 3. **Assignment Performance:** Average score across course assignments must be $\ge 50\%$.
> 4. **Examination Score:** Quiz score must be $\ge 50\%$.
> 5. **Financial Clearance:** All tuition fees for the course must be fully paid ($\text{balance} = 0$).
> If any criterion fails, the endpoint returns HTTP 400 with a detailed itemized breakdown."

---

## 5. Deployment & Production Operations Questions

### Q9: How do you handle database migrations in a production environment?
**Model Answer:**
> "We use Alembic, SQLAlchemy's migration framework. Migrations are checked into Git version control. During deployment on Render, the build command automatically runs:
> ```bash
> alembic upgrade head
> ```
> This ensures that database schema transformations (new tables, indexes, constraints) execute idempotently before the application workers start handling incoming web traffic."

### Q10: Why did you configure SPA rewrites in `vercel.json`?
**Model Answer:**
> "In a single-page React application, client-side routing is handled in the browser via the HTML5 History API (`pushState`). When a user accesses deep routes like `/courses/1` directly or refreshes the page, the static web server would naturally look for a file at `/courses/1/index.html` and return a 404 Not Found. The rewrite rule in `vercel.json`:
> ```json
> { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
> ```
> directs all incoming requests back to `/index.html`, allowing React Router to intercept the URL and render the correct view."
