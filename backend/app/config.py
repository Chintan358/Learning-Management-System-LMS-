import os
import logging
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

_INSECURE_KEY = "dev-insecure-secret-key-replace-in-production-with-real-64-byte-entropy"


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

    # JWT — default is intentionally insecure to force explicit override in prod
    SECRET_KEY: str = _INSECURE_KEY
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

    # Seed Admin — override via env vars before first deploy
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

    def validate_production_secrets(self) -> None:
        """
        Emit a loud warning (or raise) if production-unsafe defaults are
        detected.  Called once at application startup from main.py.
        """
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY == _INSECURE_KEY:
                raise RuntimeError(
                    "FATAL: SECRET_KEY is still set to the insecure development default. "
                    "Set a strong random SECRET_KEY environment variable before deploying."
                )
            if self.FIRST_ADMIN_PASSWORD == "Admin@Secure2026!":
                logger.warning(
                    "WARNING: FIRST_ADMIN_PASSWORD is still the default value. "
                    "Override FIRST_ADMIN_PASSWORD in your production environment variables."
                )
        else:
            if self.SECRET_KEY == _INSECURE_KEY:
                logger.warning(
                    "SECURITY WARNING: Using insecure default SECRET_KEY. "
                    "Set SECRET_KEY env var before production deployment."
                )

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
