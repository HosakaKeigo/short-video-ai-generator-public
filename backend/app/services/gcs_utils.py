"""
Google Cloud Storage utilities
"""

import logging
import time
from datetime import timedelta
from pathlib import Path

from google import auth
from google.cloud import storage

from app.core.settings import Settings

logger = logging.getLogger(__name__)


def generate_signed_url(
    blob: storage.Blob,
    method: str = "GET",
    expiration: timedelta = timedelta(days=1),
    content_type: str | None = None,
    settings: Settings | None = None,
) -> str:
    """
    Generate a signed URL for a Google Cloud Storage blob.

    Args:
        blob: The GCS blob object
        method: HTTP method for the URL (GET, PUT, etc.)
        expiration: How long the URL should be valid
        content_type: Content-Type header for PUT requests
        settings: Application settings (optional)

    Returns:
        A signed URL string
    """
    try:
        # Get settings if not provided
        if settings is None:
            from app.core.settings import get_settings

            settings = get_settings()

        # Define required scopes for signed URL generation
        scopes = [
            "https://www.googleapis.com/auth/devstorage.read_write",
            "https://www.googleapis.com/auth/iam",
        ]

        # Get credentials using Application Default Credentials
        # This will use GOOGLE_APPLICATION_CREDENTIALS env var if set
        credentials, _ = auth.default(scopes=scopes)

        # Refresh token to ensure it's valid
        credentials.refresh(auth.transport.requests.Request())

        # Build parameters for signed URL
        url_params = {
            "version": "v4",
            "expiration": expiration,
            "method": method,
            "service_account_email": credentials.service_account_email,
            "access_token": credentials.token,
        }

        # Add content type for PUT requests
        if method == "PUT" and content_type:
            url_params["content_type"] = content_type

        # Generate and return the signed URL
        signed_url = blob.generate_signed_url(**url_params)

        logger.debug(f"Generated signed URL for {blob.name} with method {method}")

        return signed_url
    except Exception as e:
        logger.error(f"Error generating signed URL: {e!s}")
        raise


async def get_file_info(file_id: str, settings: Settings) -> tuple[str, str]:
    """
    ファイルIDから実際のファイル情報を取得
    Returns: (file_extension, mime_type)
    """
    # サポートする動画形式
    video_formats = [
        (".mp4", "video/mp4"),
        (".mov", "video/quicktime"),
        (".avi", "video/x-msvideo"),
        (".webm", "video/webm"),
    ]

    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(settings.gcs_bucket_name)

        # 各拡張子で試す
        for ext, mime_type in video_formats:
            blob_name = f"{settings.gcs_uploads_prefix}{file_id}{ext}"
            blob = bucket.blob(blob_name)

            if blob.exists():
                logger.info(f"Found video file: {blob_name}")
                return ext, mime_type

        # ファイルが見つからない場合はデフォルトで.mp4
        logger.warning(
            f"No video file found for file_id: {file_id}, defaulting to .mp4"
        )
        return ".mp4", "video/mp4"

    except Exception as e:
        logger.error(f"Error checking file existence: {e!s}")
        return ".mp4", "video/mp4"


async def download_video_from_gcs(
    file_id: str, file_extension: str, temp_path: Path, settings: Settings
) -> Path:
    """
    GCSから動画をダウンロード

    Args:
        file_id: ファイルID
        file_extension: ファイル拡張子（.mp4など）
        temp_path: ダウンロード先の一時ディレクトリパス
        settings: アプリケーション設定

    Returns:
        ダウンロードしたファイルのローカルパス
    """
    storage_client = storage.Client()
    bucket = storage_client.bucket(settings.gcs_bucket_name)

    blob_name = f"{settings.gcs_uploads_prefix}{file_id}{file_extension}"
    blob = bucket.blob(blob_name)

    local_path = temp_path / f"{file_id}{file_extension}"

    logger.info(f"Downloading video from GCS: {blob_name}")
    download_start = time.time()
    blob.download_to_filename(str(local_path))
    download_time = time.time() - download_start
    file_size_mb = local_path.stat().st_size / (1024 * 1024)
    logger.info(
        f"Download completed: {blob_name} ({file_size_mb:.2f} MB) in {download_time:.2f} seconds"
    )

    return local_path
