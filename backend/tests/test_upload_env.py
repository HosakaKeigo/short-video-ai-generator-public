from unittest.mock import patch

import pytest

from app.core.settings import Settings
from app.models.schemas import SignedUploadUrlRequest
from app.services.upload import init_upload_service


@pytest.mark.asyncio
async def test_upload_with_missing_bucket_name():
    """GCS_BUCKET_NAME が空の場合のエラーテスト"""
    request = SignedUploadUrlRequest(
        fileName="test.mp4", fileSize=1024, contentType="video/mp4"
    )

    # Mock empty GCS_BUCKET_NAME in settings
    mock_settings = Settings(gcs_bucket_name="", use_mock_storage=False)

    with pytest.raises(
        ValueError, match="GCS_BUCKET_NAME environment variable is required"
    ):
        await init_upload_service(request, mock_settings)


@pytest.mark.asyncio
async def test_upload_validates_gcs_config():
    """validate_gcs_config が呼ばれることを確認"""
    request = SignedUploadUrlRequest(
        fileName="test.mp4", fileSize=1024, contentType="video/mp4"
    )

    # Create valid settings
    mock_settings = Settings(
        gcs_bucket_name="test-bucket",
        use_mock_storage=False,
        gcs_project_id="test-project",
    )

    with patch("app.services.upload.storage.Client") as mock_client, patch(
        "app.services.upload.generate_signed_url",
        return_value="https://example.com/signed",
    ):
        # Mock the bucket and blob
        mock_bucket = mock_client.return_value.bucket.return_value
        mock_blob = mock_bucket.blob.return_value

        await init_upload_service(request, mock_settings)

        # Verify that storage client was used
        mock_client.return_value.bucket.assert_called_once_with("test-bucket")
