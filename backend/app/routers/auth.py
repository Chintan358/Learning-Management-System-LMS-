import secrets
import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Role
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    RegisterRequest,
    UserProfileOut,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Rate limiter instance (uses the app-level limiter key func)
limiter = Limiter(key_func=get_remote_address)

# In-memory reset token store: { token: (user_id, expiry) }
# For production use a DB table or Redis; this is sufficient for a monolith.
_reset_tokens: dict = {}


@router.post("/login", response_model=TokenResponse)
@limiter.limit("1000/minute")
def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    access_token = create_access_token(data={"sub": user.id, "role": user.role.name})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(reg_data: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing = db.query(User).filter(User.email == reg_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Role is ALWAYS student — public registration cannot escalate privileges
    role = db.query(Role).filter(Role.name == "student").first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Default student role not configured. Contact administrator.",
        )

    if len(reg_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters long.",
        )

    new_user = User(
        first_name=reg_data.first_name,
        last_name=reg_data.last_name,
        email=reg_data.email,
        hashed_password=get_password_hash(reg_data.password),
        phone=reg_data.phone,
        role_id=role.id,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.id, "role": new_user.role.name})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user,
    }


@router.get("/me", response_model=UserProfileOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
def change_password(
    pwd_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(pwd_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match.",
        )

    if len(pwd_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 8 characters long.",
        )

    current_user.hashed_password = get_password_hash(pwd_data.new_password)
    db.commit()
    return {"message": "Password updated successfully."}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Issues a password-reset token. In production wire this to an email
    service (SendGrid / SES). Here the token is returned in the response
    for integration testing; in a real deploy replace with email dispatch
    and return only { "message": "..." }.
    """
    user = db.query(User).filter(User.email == req.email).first()
    # Always return 200 to prevent user enumeration
    if not user or not user.is_active:
        return {"message": "If that email exists you will receive a reset link shortly."}

    token = secrets.token_urlsafe(32)
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    _reset_tokens[token] = (user.id, expiry)

    # TODO: replace with email dispatch (e.g. SendGrid) in production
    return {
        "message": "Password reset token issued. Check your email.",
        "reset_token": token,   # remove this line after wiring email
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Validates the reset token and sets a new password."""
    entry = _reset_tokens.get(req.token)
    if not entry:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

    user_id, expiry = entry
    if datetime.datetime.utcnow() > expiry:
        del _reset_tokens[req.token]
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired. Request a new one.")

    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 8 characters long.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    del _reset_tokens[req.token]
    return {"message": "Password reset successfully. You may now log in."}

