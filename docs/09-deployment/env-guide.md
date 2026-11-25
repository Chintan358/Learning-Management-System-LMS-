# Environment Configuration Guide

This guide details all environment variables used by the Learning Management System across Local Development, Render (Backend & MySQL), and Vercel (Frontend).

---

## 1. Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `PROJECT_NAME` | No | `"LMS Enterprise Platform"` | Display title of the application API instance. |
| `VERSION` | No | `"1.0.0"` | SemVer release version of the API. |
| `ENVIRONMENT` | Yes | `production` / `development` | Dictates debug mode, stack trace exposure, and CORS. |
| `DEBUG` | No | `False` | Toggles detailed ASGI exception logs. |
| `DATABASE_URL` | **Yes** | `mysql+pymysql://user:pass@host:3306/lms_db` | Primary database connection string (MySQL on Render, SQLite locally). |
| `SECRET_KEY` | **Yes** | `f892a0b1c2d3e4f5061728394a5b6c7d...` | 256-bit cryptographically secure string used for JWT signing. |
| `ALGORITHM` | No | `HS256` | JWT signature algorithm (RFC 7519 standard). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` (24 Hours) | Lifespan of issued bearer access tokens before requiring re-login. |
| `CORS_ORIGINS` | **Yes** | `https://lms-portal.vercel.app,http://localhost:5173` | Comma-separated list of allowed frontend web origins. |
| `CLOUDINARY_CLOUD_NAME` | Optional | `your_cloudinary_cloud_name` | Cloudinary account identifier for video & assignment storage. |
| `CLOUDINARY_API_KEY` | Optional | `123456789012345` | Cloudinary API access key. |
| `CLOUDINARY_API_SECRET` | Optional | `your_cloudinary_api_secret` | Cloudinary private authentication secret. |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_YourKeyHere` | Razorpay Merchant Key ID for online checkout. |
| `RAZORPAY_KEY_SECRET` | Optional | `YourSecretKeyHere` | Razorpay private secret for HMAC-SHA256 signature verification. |

> [!WARNING]
> Never commit actual secret keys or credentials to public Git repositories. Use Render's environment dashboard for production secret storage.

---

## 2. Frontend Environment Variables (`frontend/.env`)

| Variable Name | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | `https://lms-backend.onrender.com/api/v1` | Root URL for the backend API consumed by Axios. |
| `VITE_RAZORPAY_KEY_ID` | Optional | `rzp_test_YourKeyHere` | Public merchant key passed to `window.Razorpay` script. |
| `VITE_APP_TITLE` | No | `"Institute LMS"` | Page header branding title. |

---

## 3. Render Production Setup (`render.yaml`)

The repository includes a ready-to-use Blueprint specification in `render.yaml` that provisions:
1. **Managed Database:** MySQL 8.0 instance on Render.
2. **Web Service:** Python 3.13 FastAPI backend with automatic Alembic database migrations and Uvicorn worker clustering.
