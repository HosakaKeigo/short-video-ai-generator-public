from unittest.mock import Mock, patch

import pytest

from app.models.schemas import SignedUploadUrlRequest
from app.services.upload import init_upload_service


@pytest.mark.asyncio
async def test_upload_with_extension():
    """拡張子がある場合のテスト"""
    request = SignedUploadUrlRequest(
        fileName="test_video.mp4", fileSize=1024, contentType="video/mp4"
    )

    with patch("app.services.upload.storage.Client") as mock_client:
        mock_blob = Mock()
        mock_blob.generate_signed_url.return_value = "https://example.com/signed-url"

        mock_bucket = Mock()
        mock_bucket.blob.return_value = mock_blob

        mock_client.return_value.bucket.return_value = mock_bucket

        with patch(
            "app.services.upload.generate_signed_url",
            return_value="https://example.com/signed-url",
        ):
            result = await init_upload_service(request)

            assert result.uploadUrl == "https://example.com/signed-url"
            assert result.fileId is not None
            # Verify blob name contains .mp4 extension
            mock_bucket.blob.assert_called_once()
            blob_name = mock_bucket.blob.call_args[0][0]
            assert blob_name.endswith(".mp4")


@pytest.mark.asyncio
async def test_upload_without_extension():
    """拡張子がない場合のテスト"""
    request = SignedUploadUrlRequest(
        fileName="test_video", fileSize=1024, contentType="video/mp4"
    )

    with patch("app.services.upload.storage.Client") as mock_client:
        mock_blob = Mock()
        mock_blob.generate_signed_url.return_value = "https://example.com/signed-url"

        mock_bucket = Mock()
        mock_bucket.blob.return_value = mock_blob

        mock_client.return_value.bucket.return_value = mock_bucket

        with patch(
            "app.services.upload.generate_signed_url",
            return_value="https://example.com/signed-url",
        ):
            result = await init_upload_service(request)

            assert result.uploadUrl == "https://example.com/signed-url"
            assert result.fileId is not None
            # Verify blob name contains .mp4 extension based on content type
            mock_bucket.blob.assert_called_once()
            blob_name = mock_bucket.blob.call_args[0][0]
            assert blob_name.endswith(".mp4")


@pytest.mark.asyncio
async def test_upload_with_empty_filename():
    """空のファイル名でエラーになることを確認"""
    request = SignedUploadUrlRequest(
        fileName="", fileSize=1024, contentType="video/mp4"
    )

    with pytest.raises(ValueError, match="fileName cannot be empty"):
        await init_upload_service(request)


@pytest.mark.asyncio
async def test_upload_with_unknown_content_type():
    """未知のコンテンツタイプの場合のテスト"""
    request = SignedUploadUrlRequest(
        fileName="test_video", fileSize=1024, contentType="video/unknown"
    )

    with patch("app.services.upload.storage.Client") as mock_client:
        mock_blob = Mock()
        mock_blob.generate_signed_url.return_value = "https://example.com/signed-url"

        mock_bucket = Mock()
        mock_bucket.blob.return_value = mock_blob

        mock_client.return_value.bucket.return_value = mock_bucket

        with patch(
            "app.services.upload.generate_signed_url",
            return_value="https://example.com/signed-url",
        ):
            result = await init_upload_service(request)

            # Verify it defaults to .mp4
            mock_bucket.blob.assert_called_once()
            blob_name = mock_bucket.blob.call_args[0][0]
            assert blob_name.endswith(".mp4")
