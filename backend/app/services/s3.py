from typing import Tuple, Optional
import boto3
from botocore.exceptions import ClientError
import uuid
import os
from fastapi import UploadFile

from app.core.config import settings


class S3Service:
    """Service for interacting with AWS S3 storage."""
    
    def __init__(self):
        """Initialize S3 client using AWS credentials from settings."""
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.AWS_S3_BUCKET
    
    def upload_file(self, file: UploadFile, prefix: str) -> str:
        """
        Upload a file to S3 storage.
        
        Args:
            file: The file to upload
            prefix: The prefix/folder in S3 where the file should be stored
            
        Returns:
            str: The S3 key (path) where the file was stored
            
        Raises:
            Exception: If the upload fails
        """
        try:
            # Create a unique filename to avoid collisions
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Create the S3 key (path)
            s3_key = f"{prefix}/{unique_filename}"
            
            # Upload the file to S3
            self.s3_client.upload_fileobj(
                file.file,
                self.bucket_name,
                s3_key,
                ExtraArgs={"ContentType": file.content_type}
            )
            
            return s3_key
        except ClientError as e:
            # Log the error (in a real app this would use a proper logger)
            print(f"S3 upload error: {e}")
            raise Exception(f"Failed to upload file {file.filename}: {str(e)}")
        except Exception as e:
            print(f"Unexpected error during S3 upload: {e}")
            raise Exception(f"Failed to upload file {file.filename}: {str(e)}")
    
    def generate_presigned_url(self, s3_key: str, expires_in: int = 3600) -> str:
        """
        Generate a presigned URL for accessing a file in S3.
        
        Args:
            s3_key: The S3 key (path) of the file
            expires_in: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            str: Presigned URL for accessing the file
            
        Raises:
            Exception: If URL generation fails
        """
        try:
            # Generate presigned URL
            url = self.s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": s3_key
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            # Log the error
            print(f"S3 presigned URL generation error: {e}")
            raise Exception(f"Failed to generate presigned URL for {s3_key}: {str(e)}")
        except Exception as e:
            print(f"Unexpected error during presigned URL generation: {e}")
            raise Exception(f"Failed to generate presigned URL for {s3_key}: {str(e)}")
    
    def validate_audio_file(self, file: UploadFile) -> Tuple[bool, Optional[str]]:
        """
        Validate that an uploaded file is an acceptable audio file.
        
        Args:
            file: The file to validate
            
        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        # Validate file type
        allowed_content_types = [
            "audio/mpeg",        # MP3
            "audio/wav",         # WAV
            "audio/ogg",         # OGG
            "audio/flac",        # FLAC
            "audio/x-m4a",       # M4A
            "audio/aac"          # AAC
        ]
        
        if file.content_type not in allowed_content_types:
            return False, f"Invalid file type: {file.content_type}. Allowed types: {', '.join(allowed_content_types)}"
        
        # Check file extension
        valid_extensions = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"]
        file_ext = os.path.splitext(file.filename.lower())[1]
        if file_ext not in valid_extensions:
            return False, f"Invalid file extension: {file_ext}. Allowed extensions: {', '.join(valid_extensions)}"
        
        # Validate file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50 MB in bytes
        if hasattr(file, "size") and file.size > max_size:
            return False, f"File too large. Maximum size: 50MB"
        
        return True, None
    
    def validate_image_file(self, file: UploadFile) -> Tuple[bool, Optional[str]]:
        """
        Validate that an uploaded file is an acceptable image file.
        
        Args:
            file: The file to validate
            
        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        # Validate file type
        allowed_content_types = [
            "image/jpeg",        # JPEG
            "image/png",         # PNG
            "image/gif",         # GIF
            "image/webp"         # WEBP
        ]
        
        if file.content_type not in allowed_content_types:
            return False, f"Invalid file type: {file.content_type}. Allowed types: {', '.join(allowed_content_types)}"
        
        # Check file extension
        valid_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
        file_ext = os.path.splitext(file.filename.lower())[1]
        if file_ext not in valid_extensions:
            return False, f"Invalid file extension: {file_ext}. Allowed extensions: {', '.join(valid_extensions)}"
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5 MB in bytes
        if hasattr(file, "size") and file.size > max_size:
            return False, f"File too large. Maximum size: 5MB"
        
        return True, None 