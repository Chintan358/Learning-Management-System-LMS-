from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import (
    auth,
    users,
    courses,
    batches,
    lectures,
    assignments,
    quizzes,
    attendance,
    payments,
    certificates,
    notifications,
    reports,
)

# Ensure all tables are created
Base.metadata.create_all(bind=engine)

# Validate production secrets at startup
settings.validate_production_secrets()

# Rate limiter — keyed by remote IP
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise Learning Management System (LMS) REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Attach rate-limit error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
cors_list = settings.cors_origins
allow_all = "*" in cors_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if allow_all else cors_list,
    allow_origin_regex=r"https?://.*" if allow_all else r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(courses.router, prefix=settings.API_V1_PREFIX)
app.include_router(batches.router, prefix=settings.API_V1_PREFIX)
app.include_router(lectures.router, prefix=settings.API_V1_PREFIX)
app.include_router(assignments.router, prefix=settings.API_V1_PREFIX)
app.include_router(quizzes.router, prefix=settings.API_V1_PREFIX)
app.include_router(attendance.router, prefix=settings.API_V1_PREFIX)
app.include_router(payments.router, prefix=settings.API_V1_PREFIX)
app.include_router(certificates.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Real health check — verifies the database is reachable."""
    db_status = "connected"
    try:
        db = SessionLocal()
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db.close()
    except Exception as exc:
        db_status = f"error: {str(exc)}"

    is_healthy = db_status == "connected"
    return {
        "status": "online" if is_healthy else "degraded",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
    }

