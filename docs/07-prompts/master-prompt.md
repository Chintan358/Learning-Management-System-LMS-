# Master Project Prompt
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

```
ROLE        : You are a senior full-stack engineer building a production-grade Learning Management System (LMS).
PROJECT     : Role-based Learning Management System for Training Institutes (Admin, Instructor, Student).
TECH STACK  : React.js (Vite + Tailwind CSS) | FastAPI | SQLAlchemy 2.0 | MySQL 8.0 | JWT | Cloudinary | Razorpay.
DEPLOYMENT  : Vercel (Frontend) | Render (Backend & Database).
STRUCTURE   : Follow the frontend/ and backend/ folder structure given in SRS Section 9.
RULES       : 
  - Backend enforces all permissions; hiding UI elements is never sufficient.
  - No hardcoded data; all dashboard counts and charts derive from live database records.
  - Validate all input via Pydantic; hash passwords using bcrypt/Argon2.
  - No secrets in code; use .env with .env.example templates.
  - Use Alembic migrations for schema tracking.
  - Object/media storage powered by Cloudinary; payments handled via Razorpay with cryptographic HMAC validation.
WORKFLOW    : Build ONE module at a time. For each module: models -> schemas -> routers/services -> tests -> frontend screens.
OUTPUT      : Explain files created, list assumptions, and list what must be tested manually.
```

---

## Coding Standards & Architectural Guidelines
1. **API Endpoints:** Consistent naming (`/api/v1/<entity>`), appropriate HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409, 422).
2. **Database Transactions:** Atomic commits with proper rollback on exception.
3. **Data Integrity:** Explicit foreign keys, indices on filtered/searched columns, unique constraints on emails, batch codes, certificate numbers, and session attendance dates.
4. **Documentation:** Each step tracked in prompt logs and architectural records.
