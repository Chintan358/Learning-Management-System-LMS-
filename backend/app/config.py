import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Learning Management System"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    PORT: int = 8000

    # CORS (supports either ALLOWED_ORIGINS or CORS_ORIGINS env var)
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://lms-portal-pied-zeta.vercel.app"
    CORS_ORIGINS: str = ""

    # Database
    DATABASE_URL: str = "sqlite:///./lms.db"

    # JWT
    SECRET_KEY: str = "dev-insecure-secret-key-replace-in-production-with-real-64-byte-entropy"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # Seed Admin
    FIRST_ADMIN_EMAIL: str = "admin@lms.edu"
    FIRST_ADMIN_PASSWORD: str = "Admin@Secure2026!"
    FIRST_ADMIN_FIRST_NAME: str = "System"
    FIRST_ADMIN_LAST_NAME: str = "Administrator"

    @property
    def cors_origins(self) -> List[str]:
        raw = self.CORS_ORIGINS.strip() or self.ALLOWED_ORIGINS.strip()
        if not raw:
            return ["*"]
        return [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
