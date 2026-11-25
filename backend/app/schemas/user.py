from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from app.schemas.auth import RoleOut


class InstructorProfileCreate(BaseModel):
    bio: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = 0


class InstructorProfileOut(BaseModel):
    id: int
    bio: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: int

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = True
    instructor_profile: Optional[InstructorProfileCreate] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    instructor_profile: Optional[InstructorProfileCreate] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    role: RoleOut
    created_at: datetime
    updated_at: datetime
    instructor_profile: Optional[InstructorProfileOut] = None

    model_config = ConfigDict(from_attributes=True)
