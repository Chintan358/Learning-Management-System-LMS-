"""
Shared pytest fixtures providing an isolated in-memory SQLite test database
so the test suite never touches the production / development lms.db file.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.utils.seed_data import seed_all  # re-seeds roles, users, courses, batches

# ── Isolated test database ───────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite:///./test_lms.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all tables once per test session and seed baseline data."""
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        seed_all(db)
    except Exception:
        db.rollback()
    finally:
        db.close()
    yield
    # Teardown: drop all tables after the full test session
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def db():
    """Per-test transactional database session that rolls back after each test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="session")
def client():
    """
    HTTP test client wired to the isolated test DB.
    Session-scoped so we pay the app-startup cost once.
    """
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def admin_token(client):
    """JWT token for the seeded admin account."""
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@lms.edu", "password": "Admin@Secure2026!"},
    )
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def student_token(client):
    """JWT token for the seeded student account."""
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "student@lms.edu", "password": "Student@Secure2026!"},
    )
    assert res.status_code == 200, f"Student login failed: {res.text}"
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def instructor_token(client):
    """JWT token for the seeded instructor account."""
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "instructor@lms.edu", "password": "Instructor@Secure2026!"},
    )
    assert res.status_code == 200, f"Instructor login failed: {res.text}"
    return res.json()["access_token"]
