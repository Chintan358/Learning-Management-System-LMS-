from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Role, InstructorProfile
from app.schemas.user import UserOut, UserCreate, UserUpdate, InstructorProfileOut
from app.dependencies.auth import get_current_user, require_role
from app.utils.security import get_password_hash

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("", response_model=List[UserOut])
def list_users(
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if role:
        query = query.join(Role).filter(Role.name == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.first_name.ilike(search_pattern))
            | (User.last_name.ilike(search_pattern))
            | (User.email.ilike(search_pattern))
        )
    return query.offset(skip).limit(limit).all()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        )

    role = db.query(Role).filter(Role.name == user_data.role_name).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{user_data.role_name}' does not exist.",
        )

    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        phone=user_data.phone,
        avatar_url=user_data.avatar_url,
        is_active=user_data.is_active if user_data.is_active is not None else True,
        role_id=role.id,
    )
    db.add(new_user)
    db.flush()

    if user_data.role_name == "instructor" and user_data.instructor_profile:
        inst_profile = InstructorProfile(
            user_id=new_user.id,
            bio=user_data.instructor_profile.bio,
            qualification=user_data.instructor_profile.qualification,
            specialization=user_data.instructor_profile.specialization,
            experience_years=user_data.instructor_profile.experience_years or 0,
        )
        db.add(inst_profile)

    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Non-admins can only view their own user profile
    if current_user.role.name != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only view your own user profile.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.name != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only update your own user profile.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if update_data.first_name is not None:
        user.first_name = update_data.first_name
    if update_data.last_name is not None:
        user.last_name = update_data.last_name
    if update_data.phone is not None:
        user.phone = update_data.phone
    if update_data.avatar_url is not None:
        user.avatar_url = update_data.avatar_url
    if update_data.password is not None and update_data.password != "":
        user.hashed_password = get_password_hash(update_data.password)

    # Only admin can toggle active status
    if update_data.is_active is not None and current_user.role.name == "admin":
        user.is_active = update_data.is_active

    # Update instructor profile if applicable
    if update_data.instructor_profile and user.role.name == "instructor":
        profile = db.query(InstructorProfile).filter(InstructorProfile.user_id == user.id).first()
        if not profile:
            profile = InstructorProfile(user_id=user.id)
            db.add(profile)
        if update_data.instructor_profile.bio is not None:
            profile.bio = update_data.instructor_profile.bio
        if update_data.instructor_profile.qualification is not None:
            profile.qualification = update_data.instructor_profile.qualification
        if update_data.instructor_profile.specialization is not None:
            profile.specialization = update_data.instructor_profile.specialization
        if update_data.instructor_profile.experience_years is not None:
            profile.experience_years = update_data.instructor_profile.experience_years

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own administrator account.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.is_active = False
    db.commit()
    return {"message": f"User {user.email} has been deactivated successfully."}
