from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import Generator
from app.config import settings

# Normalize database URL for SQLAlchemy 2.0 compatibility
# Render / Heroku postgres URLs start with postgres://, which must be converted to postgresql://
raw_db_url = settings.DATABASE_URL
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

# Configure engine with SQLite compatibility for local dev and connection pooling for PostgreSQL/MySQL
connect_args = {}
if raw_db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    engine = create_engine(
        raw_db_url,
        connect_args=connect_args,
        echo=settings.DEBUG,
    )
else:
    engine = create_engine(
        raw_db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,
        echo=settings.DEBUG,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
