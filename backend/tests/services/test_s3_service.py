import pytest
from unittest.mock import patch, MagicMock
import boto3
from botocore.exceptions import ClientError
import io
import os
from fastapi import UploadFile

from app.services.s3 import S3Service
from app.core.config import settings


@pytest.fixture
def s3_service():
    """Fixture for S3Service with mocked boto3 client."""
    with patch("boto3.client") as mock_client:
        mock_s3 = MagicMock()
        mock_client.return_value = mock_s3
        service = S3Service()
        service.s3_client = mock_s3
        yield service


class TestS3Service:
    """Tests for S3 storage service."""
    
    def test_init_creates_s3_client(self):
        """Test that S3Service initializes a boto3 S3 client."""
        with patch("boto3.client") as mock_client:
            S3Service()
            mock_client.assert_called_once_with(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
    
    def test_upload_file_success(self, s3_service):
        """Test successful file upload to S3."""
        # Mock file content
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.mp3"
        mock_file.file = io.BytesIO(b"test content")
        mock_file.content_type = "audio/mpeg"
        
        # Mock S3 upload response
        s3_service.s3_client.upload_fileobj.return_value = None
        
        # Call the upload function
        result = s3_service.upload_file(mock_file, "songs")
        
        # Assert the file was uploaded with correct parameters
        s3_service.s3_client.upload_fileobj.assert_called_once()
        assert result.startswith("songs/")
        assert result.endswith(".mp3")  # Just check file extension instead of the full filename
    
    def test_upload_file_failure(self, s3_service):
        """Test file upload failure handling."""
        # Mock file
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.mp3"
        mock_file.file = io.BytesIO(b"test content")
        
        # Mock S3 upload error
        s3_service.s3_client.upload_fileobj.side_effect = ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
            "upload_fileobj"
        )
        
        # Assert the exception is raised
        with pytest.raises(Exception) as exc_info:
            s3_service.upload_file(mock_file, "songs")
        
        assert "Failed to upload file" in str(exc_info.value)
    
    def test_generate_presigned_url_success(self, s3_service):
        """Test successful generation of presigned URL."""
        # Mock the presigned URL response
        expected_url = "https://test-bucket.s3.amazonaws.com/songs/test.mp3"
        s3_service.s3_client.generate_presigned_url.return_value = expected_url
        
        # Call the function
        url = s3_service.generate_presigned_url("songs/test.mp3")
        
        # Assert the URL was generated correctly
        assert url == expected_url
        s3_service.s3_client.generate_presigned_url.assert_called_once_with(
            ClientMethod="get_object",
            Params={
                "Bucket": settings.AWS_S3_BUCKET,
                "Key": "songs/test.mp3"
            },
            ExpiresIn=3600
        )
    
    def test_generate_presigned_url_failure(self, s3_service):
        """Test presigned URL generation failure handling."""
        # Mock S3 error
        s3_service.s3_client.generate_presigned_url.side_effect = ClientError(
            {"Error": {"Code": "NoSuchKey", "Message": "The specified key does not exist."}},
            "generate_presigned_url"
        )
        
        # Assert the exception is raised
        with pytest.raises(Exception) as exc_info:
            s3_service.generate_presigned_url("songs/nonexistent.mp3")
        
        assert "Failed to generate presigned URL" in str(exc_info.value)
    
    def test_validate_audio_file_valid(self, s3_service):
        """Test validation of valid audio file."""
        # Mock file with valid audio content type
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.mp3"
        mock_file.content_type = "audio/mpeg"
        mock_file.size = 1024 * 1024 * 5  # 5MB
        
        # Call validation function
        is_valid, _ = s3_service.validate_audio_file(mock_file)
        
        # Assert the file is considered valid
        assert is_valid is True
    
    def test_validate_audio_file_invalid_type(self, s3_service):
        """Test validation rejects invalid audio file types."""
        # Mock file with invalid content type
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.txt"
        mock_file.content_type = "text/plain"
        mock_file.size = 1024 * 1024  # 1MB
        
        # Call validation function
        is_valid, message = s3_service.validate_audio_file(mock_file)
        
        # Assert the file is rejected
        assert is_valid is False
        assert "Invalid file type" in message
    
    def test_validate_audio_file_too_large(self, s3_service):
        """Test validation rejects files that are too large."""
        # Mock file that's too large
        mock_file = MagicMock(spec=UploadFile)
        mock_file.filename = "test.mp3"
        mock_file.content_type = "audio/mpeg"
        mock_file.size = 1024 * 1024 * 51  # 51MB
        
        # Call validation function
        is_valid, message = s3_service.validate_audio_file(mock_file)
        
        # Assert the file is rejected
        assert is_valid is False
        assert "File too large" in message 