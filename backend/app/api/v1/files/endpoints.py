from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app import models
from app.api.dependencies import get_db, get_current_active_user, get_current_active_superuser
from app.services.s3 import S3Service

router = APIRouter()


class FileUploadResponse(BaseModel):
    """Response model for file uploads."""
    file_path: str
    url: str


class PresignedUrlResponse(BaseModel):
    """Response model for presigned URL requests."""
    url: str


@router.post("/upload/audio", response_model=FileUploadResponse)
async def upload_audio_file(
    *,
    file: UploadFile = File(...),
    description: str = Form(""),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Upload an audio file to the server.
    
    This endpoint allows users to upload audio files (MP3, WAV, etc.) to the server.
    Files are validated for type and size before being stored in S3.
    
    Returns the file path and a presigned URL for immediate access.
    """
    s3_service = S3Service()
    
    # Validate the file
    is_valid, validation_message = s3_service.validate_audio_file(file)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=validation_message
        )
    
    try:
        # Upload the file to S3
        file_path = s3_service.upload_file(file, "audio")
        
        # Generate a presigned URL for immediate access
        url = s3_service.generate_presigned_url(file_path)
        
        # Return the file path and URL
        return FileUploadResponse(
            file_path=file_path,
            url=url
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/upload/image", response_model=FileUploadResponse)
async def upload_image_file(
    *,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Upload an image file to the server.
    
    This endpoint allows users to upload image files (JPEG, PNG, etc.) to the server.
    Files are validated for type and size before being stored in S3.
    
    Returns the file path and a presigned URL for immediate access.
    """
    s3_service = S3Service()
    
    # Validate the file
    is_valid, validation_message = s3_service.validate_image_file(file)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=validation_message
        )
    
    try:
        # Upload the file to S3
        file_path = s3_service.upload_file(file, "images")
        
        # Generate a presigned URL for immediate access
        url = s3_service.generate_presigned_url(file_path)
        
        # Return the file path and URL
        return FileUploadResponse(
            file_path=file_path,
            url=url
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/presigned-url/{file_path:path}", response_model=PresignedUrlResponse)
async def get_presigned_url(
    *,
    file_path: str,
    expires: Optional[int] = 3600,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Generate a presigned URL for accessing a file.
    
    This endpoint generates a temporary URL that allows access to a file in S3.
    The URL expires after the specified time (default: 1 hour).
    
    Args:
        file_path: The path of the file in S3
        expires: The expiration time in seconds (default: 3600)
    
    Returns:
        A presigned URL for accessing the file
    """
    s3_service = S3Service()
    
    try:
        # Generate a presigned URL
        url = s3_service.generate_presigned_url(file_path, expires_in=expires)
        
        # Return the URL
        return PresignedUrlResponse(url=url)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 