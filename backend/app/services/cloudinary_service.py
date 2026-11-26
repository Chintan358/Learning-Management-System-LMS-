import os
import uuid
from typing import Dict, Any
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException
from app.config import settings

# Initialize Cloudinary – raise if essential credentials are missing
if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET):
    raise HTTPException(status_code=500, detail="Cloudinary credentials are not configured.")

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

def upload_file_to_cloudinary(
    file_bytes: bytes,
    filename: str,
    folder: str = "lms_uploads",
    resource_type: str = "auto",
) -> Dict[str, Any]:
    """Upload a file to Cloudinary.
    Credentials are required; this function assumes they are valid.
    """
    # Direct upload – any exception will propagate as a 500 error
    response = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        resource_type=resource_type,
        public_id=f"{uuid.uuid4().hex[:8]}_{os.path.splitext(filename)[0]}",
    )
    return {
        "secure_url": response.get("secure_url"),
        "public_id": response.get("public_id"),
        "format": response.get("format"),
        "bytes": response.get("bytes"),
    }

