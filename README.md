# Learning Management System (LMS) – Enterprise Full-Stack Application

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black.svg?logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Render-Backend%20%26%20DB-46E3B7.svg?logo=render&logoColor=white)](https://render.com)

A role-based web platform designed for training institutes to manage academic, administrative, and financial activities from a centralized portal.

---

## 1. Project Overview & Features

### Role-Based Portals:
* **Admin:** System governance, student/instructor provisioning, course catalogue management, batch scheduling, financial ledgers, and institutional analytics.
* **Instructor:** Course curriculum authoring, lecture & study material publishing, assignment review with rubric grading, MCQ quiz creation, and batch roll-call attendance.
* **Student:** Interactive syllabus viewer, lecture progress tracking, assignment submissions, timed MCQ examinations with instant scores, fee payment via Razorpay, and verifiable PDF completion certificates.

### Key Capabilities:
* **Cloud Object Storage:** Cloudinary integration for thumbnails, study materials, and student assignment deliverables.
* **Online Payment Gateway:** Razorpay integration supporting UPI, cards, and net-banking with cryptographic HMAC-SHA256 signature verification.
* **Certificate Engine:** PDF certificate generation with unique verification hashes and a public verification route (`/verify-certificate/{code}`).
* **Security & RBAC:** JWT bearer tokens, bcrypt/Argon2 password hashing, and server-side authorization filters.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Lucide Icons, Recharts | Responsive SaaS-style web interface |
| **Backend** | Python FastAPI, Pydantic v2, Uvicorn | High-performance RESTful API endpoints |
| **ORM & Migrations** | SQLAlchemy 2.0, Alembic | Database models and schema versioning |
| **Database** | MySQL 8.0 (Render / Cloud MySQL) | Persistent relational data store |
| **File Storage** | Cloudinary | Cloud asset and document hosting |
| **Payments** | Razorpay | Online order checkout and verification |
| **Deployment** | Vercel (Frontend), Render (Backend & DB) | High-availability cloud hosting |

---

## 3. Directory Structure

```
LMS/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── dependencies/     # DB injection & RBAC authorization
│   │   ├── middleware/       # CORS, rate limiting, error handlers
│   │   ├── models/           # 24 SQLAlchemy ORM entities
│   │   ├── routers/          # Modular API endpoints
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic (Razorpay, Cloudinary, PDF)
│   │   ├── utils/            # JWT, password hashing, helpers
│   │   ├── config.py         # Application settings
│   │   ├── database.py       # Engine & session management
│   │   └── main.py           # Application entrypoint
│   ├── migrations/           # Alembic migrations
│   ├── tests/                # Pytest automated test suites
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Container definition for Render
├── frontend/                 # React.js SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth & notification state providers
│   │   ├── layouts/          # Role-based dashboard layouts
│   │   ├── pages/            # View components
│   │   ├── routes/           # Protected routing configuration
│   │   └── services/         # Axios API clients
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json           # Vercel SPA rewrites
└── docs/                     # Comprehensive SRS Documentation (Section 19 & 20)
    ├── 01-requirements/      # SRS notes & Use cases
    ├── 02-design/            # ERD, Data dictionary, Wireframes
    ├── 03-business-rules/    # Policies & formulas
    ├── 04-architecture/      # Architecture & Security specifications
    ├── 05-api/               # API endpoints & Postman collection
    ├── 06-modules/           # Per-module technical documentation
    ├── 07-prompts/           # Master prompt & Prompt log
    ├── 08-testing/           # Test plan, Test reports & Known issues
    ├── 09-deployment/        # Deployment & Environment guides
    ├── 10-user-manual/       # Role-specific user guides
    └── 11-reports/           # Progress logs, Changelogs & Final report
```

---

## 4. Documentation Index

The complete documentation suite required by SRS Sections 19 & 20 is organized under `/docs`:
- [SRS Notes](docs/01-requirements/srs-notes.md)
- [Use Cases & User Stories](docs/01-requirements/use-cases.md)
- [Entity Relationship Diagram](docs/02-design/erd.md)
- [Comprehensive Data Dictionary](docs/02-design/data-dictionary.md)
- [Frontend UI/UX Specifications](docs/02-design/wireframes-spec.md)
- [Institutional Policies & Business Rules](docs/03-business-rules/policies.md)
- [System Architecture](docs/04-architecture/architecture.md)
- [Security Architecture](docs/04-architecture/security.md)
- [Master AI Prompt](docs/07-prompts/master-prompt.md)
- [AI Prompt Log](docs/07-prompts/prompt-log.md)
- [Progress Log](docs/11-reports/progress-log.md)

---

## 5. Local Setup & Quick Start

### Prerequisites
* Python 3.11+
* Node.js v18+ & npm
* MySQL 8.0 (or Docker)

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Configure database and service credentials in .env
alembic upgrade head
python -m app.utils.seed_data   # Seeds initial roles & admin account
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Client will be live at: `http://localhost:5173`

---

## 6. Deployment Guide Summary
* **Frontend:** Hosted on **Vercel** with single-page application routing configured in `vercel.json`.
* **Backend:** Hosted on **Render** as a Python Web Service or Docker container with managed MySQL.
