import io
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.services.s3 import S3Service
from main import app


def test_upload_audio_file(client: TestClient, auth_headers: dict):
    """Test the audio file upload endpoint."""
    with patch.object(S3Service, 'upload_file') as mock_upload:
        with patch.object(S3Service, 'generate_presigned_url') as mock_url:
            # Mock the upload and presigned URL methods
            mock_upload.return_value = "audio/test-file-uuid.mp3"
            mock_url.return_value = "https://test-bucket.s3.amazonaws.com/audio/test-file-uuid.mp3"
            
            # Create a mock file
            mock_file = io.BytesIO(b"test audio content")
            
            # Make the request
            response = client.post(
                "/api/v1/files/upload/audio",
                headers=auth_headers,
                files={"file": ("test.mp3", mock_file, "audio/mpeg")},
                data={"description": "Test audio file"}
            )
            
            # Check response
            assert response.status_code == 200
            assert "file_path" in response.json()
            assert "url" in response.json()
            assert response.json()["file_path"] == "audio/test-file-uuid.mp3"
            assert response.json()["url"] == "https://test-bucket.s3.amazonaws.com/audio/test-file-uuid.mp3"
            
            # Verify the mocks were called
            mock_upload.assert_called_once()
            mock_url.assert_called_once_with("audio/test-file-uuid.mp3")


def test_upload_invalid_audio_file(client: TestClient, auth_headers: dict):
    """Test uploading an invalid audio file."""
    # Create a mock file with invalid type
    mock_file = io.BytesIO(b"this is a text file, not audio")
    
    # Make the request
    response = client.post(
        "/api/v1/files/upload/audio",
        headers=auth_headers,
        files={"file": ("test.txt", mock_file, "text/plain")},
        data={"description": "Invalid file"}
    )
    
    # Check response
    assert response.status_code == 400
    assert "detail" in response.json()
    assert "Invalid file type" in response.json()["detail"]


def test_upload_image_file(client: TestClient, auth_headers: dict):
    """Test the image file upload endpoint."""
    with patch.object(S3Service, 'upload_file') as mock_upload:
        with patch.object(S3Service, 'generate_presigned_url') as mock_url:
            # Mock the upload and presigned URL methods
            mock_upload.return_value = "images/test-image-uuid.jpg"
            mock_url.return_value = "https://test-bucket.s3.amazonaws.com/images/test-image-uuid.jpg"
            
            # Create a mock file
            mock_file = io.BytesIO(b"test image content")
            
            # Make the request
            response = client.post(
                "/api/v1/files/upload/image",
                headers=auth_headers,
                files={"file": ("test.jpg", mock_file, "image/jpeg")},
            )
            
            # Check response
            assert response.status_code == 200
            assert "file_path" in response.json()
            assert "url" in response.json()
            assert response.json()["file_path"] == "images/test-image-uuid.jpg"
            assert response.json()["url"] == "https://test-bucket.s3.amazonaws.com/images/test-image-uuid.jpg"
            
            # Verify the mocks were called
            mock_upload.assert_called_once()
            mock_url.assert_called_once_with("images/test-image-uuid.jpg")


def test_get_presigned_url(client: TestClient, auth_headers: dict):
    """Test the presigned URL generation endpoint."""
    with patch.object(S3Service, 'generate_presigned_url') as mock_url:
        # Mock the presigned URL method
        mock_url.return_value = "https://test-bucket.s3.amazonaws.com/audio/test-file.mp3?signature=xyz"
        
        # Make the request
        response = client.get(
            "/api/v1/files/presigned-url/audio/test-file.mp3",
            headers=auth_headers
        )
        
        # Check response
        assert response.status_code == 200
        assert "url" in response.json()
        assert response.json()["url"] == "https://test-bucket.s3.amazonaws.com/audio/test-file.mp3?signature=xyz"
        
        # Verify the mock was called
        mock_url.assert_called_once_with("audio/test-file.mp3", expires_in=3600)


def test_get_presigned_url_with_custom_expiry(client: TestClient, auth_headers: dict):
    """Test presigned URL generation with custom expiration time."""
    with patch.object(S3Service, 'generate_presigned_url') as mock_url:
        # Mock the presigned URL method
        mock_url.return_value = "https://test-bucket.s3.amazonaws.com/audio/test-file.mp3?signature=xyz"
        
        # Make the request with custom expiry
        response = client.get(
            "/api/v1/files/presigned-url/audio/test-file.mp3?expires=7200",
            headers=auth_headers
        )
        
        # Check response
        assert response.status_code == 200
        assert "url" in response.json()
        
        # Verify the mock was called with custom expiry
        mock_url.assert_called_once_with("audio/test-file.mp3", expires_in=7200) 