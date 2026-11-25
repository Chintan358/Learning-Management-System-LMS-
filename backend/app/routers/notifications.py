from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification, Announcement
from app.models.user import User
from app.schemas.notification import (
    NotificationOut,
    AnnouncementCreate,
    AnnouncementOut,
)
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/notifications", tags=["Notifications & Announcements"])


@router.get("", response_model=List[NotificationOut])
def get_user_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(50).all()


@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()

    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read."}


@router.get("/announcements", response_model=List[AnnouncementOut])
def list_announcements(
    batch_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Announcement)
    if batch_id:
        query = query.filter((Announcement.batch_id == batch_id) | (Announcement.batch_id == None))
    return query.order_by(Announcement.created_at.desc()).limit(20).all()


@router.post("/announcements", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(
    data: AnnouncementCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    ann = Announcement(
        title=data.title,
        content=data.content,
        target_role=data.target_role,
        batch_id=data.batch_id,
        created_by=current_user.id,
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann
