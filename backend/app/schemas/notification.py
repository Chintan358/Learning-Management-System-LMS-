from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserProfileOut


class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    target_role: Optional[str] = None  # None = all, or "student", "instructor"
    batch_id: Optional[int] = None


class AnnouncementOut(BaseModel):
    id: int
    title: str
    content: str
    target_role: Optional[str] = None
    batch_id: Optional[int] = None
    created_by: int
    created_at: datetime
    author: Optional[UserProfileOut] = None

    model_config = ConfigDict(from_attributes=True)
