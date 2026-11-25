# System Architecture & Technical Design
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    Client["Browser Clients (Desktop & Mobile)"]
    Vercel["Frontend Host (Vercel CDN)
React.js + Tailwind CSS + Vite"]
    RenderBackend["Backend API Host (Render Web Service)
Python FastAPI + Uvicorn"]
    MySQL["Persistent Database (Render / Cloud MySQL 8.0)
SQLAlchemy 2.0 + Alembic"]
    Cloudinary["Media Storage (Cloudinary CDN)
Images, PDFs, Attachments"]
    Razorpay["Payment Gateway (Razorpay API)
Orders, Signatures, Webhooks"]

    Client -->|HTTPS / Static Assets| Vercel
    Client -->|REST API Requests with JWT Bearer| RenderBackend
    RenderBackend -->|SQLAlchemy Connection Pool| MySQL
    RenderBackend -->|Direct Upload & Asset Signing| Cloudinary
    Client -->|Direct File Upload / Preview| Cloudinary
    RenderBackend -->|Order Creation & HMAC Verification| Razorpay
    Client -->|Razorpay Checkout Modal| Razorpay
```

---

## 2. Layered Component Architecture

### 2.1 Frontend Presentation Layer (React.js + Tailwind CSS)
* **Build Tooling:** Vite for near-instant Hot Module Replacement (HMR) and optimized minified production rollups.
* **Routing:** `react-router-dom` v6 with role-aware `<ProtectedRoute role={["admin"]} />` guards.
* **State Management:**
  - `AuthContext`: Centralized user session, token lifecycle, and role state.
  - `NotificationContext`: Real-time toast alerts and polling for unread messages.
* **API Service Layer:** Axios instance pre-configured with `baseURL`, automatic request interceptor attaching `Authorization: Bearer <token>`, and response interceptor redirecting to login on HTTP 401.
* **Visualizations:** `recharts` for administrative KPI trends, enrollment charts, and revenue comparisons.

### 2.2 Backend Application Layer (Python FastAPI)
* **Framework:** FastAPI utilizing ASGI (`uvicorn`) for asynchronous non-blocking I/O.
* **Validation & Serialization:** Pydantic v2 schemas providing strict type enforcement, input sanitization, and output filtering (excluding sensitive hash columns).
* **Dependency Injection:**
  - `get_db`: Yields transactional SQLAlchemy database sessions per request.
  - `get_current_user`: Decodes and validates JWT bearer tokens.
  - `require_role(["admin", ...])`: Enforces role-based permissions per endpoint.
* **Services Layer:** Decoupled business logic isolated from HTTP routing (e.g. `PaymentService`, `CertificateService`, `MediaService`).

### 2.3 Data & Persistence Layer (MySQL & SQLAlchemy)
* **ORM:** SQLAlchemy 2.0 declarative models with typed relationships.
* **Connection Pooling:** `QueuePool` with health ping (`pool_pre_ping=True`) to handle dropped connections gracefully.
* **Database Migrations:** Alembic manages schema version control.

---

## 3. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client
    participant Frontend as React SPA (Vercel)
    participant Backend as FastAPI Backend (Render)
    participant DB as MySQL Database

    User->>Frontend: Enters Email & Password
    Frontend->>Backend: POST /api/auth/login
    Backend->>DB: Query user by email
    DB-->>Backend: Return User Record + Hashed Password
    Backend->>Backend: Verify bcrypt/Argon2 hash & check is_active
    Backend->>Backend: Generate JWT (sub=user_id, role=role, exp=24h)
    Backend-->>Frontend: 200 OK { access_token, user_profile }
    Frontend->>Frontend: Store token in secure storage / state
    Frontend-->>User: Redirect to Role Dashboard (Admin/Instructor/Student)

    Note over User,DB: Subsequent Protected Request
    User->>Frontend: Navigates to Protected Resource
    Frontend->>Backend: GET /api/courses (Header: Bearer JWT)
    Backend->>Backend: require_role(['admin', 'instructor']) dependency
    Backend->>DB: Fetch permitted course records
    DB-->>Backend: Records
    Backend-->>Frontend: 200 OK [ CourseList ]
```

---

## 4. Key Architectural Decisions & Trade-Offs

| Decision | Selected Approach | Alternative Considered | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React.js with Vite | Next.js / Nuxt | Meets SRS requirements, simpler static export to Vercel, decoupled from backend. |
| **Styling** | Tailwind CSS | Material UI / Bootstrap | Recommended by SRS; provides complete design control, responsive utilities, and zero runtime overhead. |
| **Backend Framework** | Python FastAPI | Django / Flask | FastAPI offers automatic OpenAPI docs, native async support, and high performance with Pydantic validation. |
| **Object Storage** | Cloudinary | Local disk / AWS S3 | User specified Cloudinary; provides CDN transformation, asset security, and reliable persistent storage. |
| **Payment Gateway** | Razorpay | Stripe / PayPal | User specified Razorpay; industry standard in INR/regional payments with straightforward API and webhook validation. |
