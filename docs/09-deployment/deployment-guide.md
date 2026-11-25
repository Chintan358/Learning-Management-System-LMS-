# Production Deployment & Hosting Runbook

This guide describes the end-to-end deployment procedures for launching the Learning Management System (LMS) into production using **Render** for backend and database, and **Vercel** for frontend single-page application hosting.

---

## 1. Architecture Deployment Overview

```
                      ┌──────────────────────────────────────┐
                      │             End User UI              │
                      │        (Web / Mobile Browser)        │
                      └──────────────────┬───────────────────┘
                                         │ HTTPS Requests
                                         ▼
                 ┌────────────────────────────────────────────────┐
                 │             Vercel Edge Network                │
                 │      (React 18 + Vite SPA, vercel.json)        │
                 └───────────────────────┬────────────────────────┘
                                         │ REST API / JSON
                                         ▼
                 ┌────────────────────────────────────────────────┐
                 │               Render Web Service               │
                 │    (Python 3.13 + FastAPI + Uvicorn + Gunicorn) │
                 └───────────────┬────────────────┬───────────────┘
                                 │                │
            SQLAlchemy Connection │                │ External SDKs
                                 ▼                ▼
┌──────────────────────────────────────────┐   ┌───────────────────────────────┐
│          Render Managed Database         │   │   External Cloud Ecosystem    │
│            (MySQL 8.0 Engine)            │   │  • Cloudinary (Media Assets)  │
│          24 Normalized Tables            │   │  • Razorpay (Paise Checkout)  │
└──────────────────────────────────────────┘   └───────────────────────────────┘
```

---

## 2. Deploying Backend & Database to Render

### Step 2.1: Provision Render Managed MySQL Database
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **PostgreSQL or MySQL Database** (Select MySQL 8.0).
3. Set the database name: `lms_production_db`.
4. Copy the **Internal Connection String** (format: `mysql+pymysql://<user>:<password>@<host>:3306/<dbname>`).

### Step 2.2: Provision Web Service
1. In Render, click **New +** -> **Web Service**.
2. Connect your Git repository (`LMS`).
3. Configure service parameters:
   - **Name:** `lms-backend-api`
   - **Region:** Singapore / Frankfurt / Oregon (nearest to users)
   - **Branch:** `master`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && alembic upgrade head && python app/utils/seed_data.py
     ```
   - **Start Command:**
     ```bash
     gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT
     ```
4. Add Environment Variables:
   - `DATABASE_URL`: *(Your Render MySQL connection string)*
   - `ENVIRONMENT`: `production`
   - `SECRET_KEY`: *(Generate via `openssl rand -hex 32`)*
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app`
   - `CLOUDINARY_CLOUD_NAME`: *(Your Cloudinary cloud name)*
   - `CLOUDINARY_API_KEY`: *(Your Cloudinary key)*
   - `CLOUDINARY_API_SECRET`: *(Your Cloudinary secret)*
   - `RAZORPAY_KEY_ID`: *(Your Razorpay Key ID)*
   - `RAZORPAY_KEY_SECRET`: *(Your Razorpay Secret Key)*
5. Click **Create Web Service**. Render will install dependencies, execute database migrations, seed foundational roles, and start the Uvicorn web workers.

---

## 3. Deploying Frontend to Vercel

### Step 3.1: Connect Git Repository to Vercel
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New Project** -> **Import Git Repository**.
3. Select your repository: `LMS`.

### Step 3.2: Configure Project Settings
1. Set **Root Directory** to `frontend`.
2. Framework Preset: **Vite** (automatically detected).
3. Build & Output Settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://lms-backend-api.onrender.com/api/v1`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_test_YourKey`
5. Click **Deploy**.

### Step 3.3: SPA Routing Rewrites (`vercel.json`)
The repository contains `frontend/vercel.json` to prevent HTTP 404 errors when users refresh deep URLs (`/courses/1`, `/verify-certificate/CERT-01`):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. Post-Deployment Verification Checklist

- [ ] `GET https://lms-backend-api.onrender.com/api/v1/health` returns `{"status": "healthy"}`.
- [ ] Log in with seeded admin credentials `admin@lms.edu` / `Admin@Secure2026!`.
- [ ] Create a test course and assign it to an instructor.
- [ ] Test student enrollment and Razorpay test checkout.
- [ ] Generate a graduation certificate and test public lookup on `/verify-certificate/:code`.
- [ ] Export enrollments and revenue CSV reports.
