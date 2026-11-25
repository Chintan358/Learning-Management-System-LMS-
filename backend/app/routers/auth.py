from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Role
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    RegisterRequest,
    UserProfileOut,
    ChangePasswordRequest,
)
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
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

    role_name = reg_data.role or "student"
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {role_name}",
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

    if len(pwd_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 6 characters long.",
        )

    current_user.hashed_password = get_password_hash(pwd_data.new_password)
    db.commit()
    return {"message": "Password updated successfully."}
