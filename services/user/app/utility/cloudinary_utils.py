# utils/cloudinary_utils.py
import cloudinary.uploader
from fastapi import UploadFile
from typing import Optional

def upload_to_cloudinary(file: UploadFile, folder: str, public_id: Optional[str] = None) -> str:
    filename = file.filename.lower()
    resource_type = "raw" if filename.endswith(".pdf") else "auto"

    result = cloudinary.uploader.upload(
        file.file,
        folder=folder,
        public_id=public_id,
        resource_type=resource_type,
        overwrite=True
    )
    return result["secure_url"]
