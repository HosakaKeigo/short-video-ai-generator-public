import datetime as dt
import logging
from uuid import uuid4

from google.cloud import storage

from app.core.settings import Settings, get_settings
from app.models.schemas import SignedUploadUrlRequest, SignedUploadUrlResponse
from app.services.gcs_utils import generate_signed_url

logger = logging.getLogger(__name__)


async def init_upload_service(
    request: SignedUploadUrlRequest,
    settings: Settings | None = None,
) -> SignedUploadUrlResponse:
    """
    動画アップロードの初期化処理
    Google Cloud Storageの署名付きURLを生成する
    """
    # Get settings if not provided
    if settings is None:
        settings = get_settings()

    # 入力検証
    if not request.fileName or request.fileName.strip() == "":
        msg = "fileName cannot be empty"
        raise ValueError(msg)

    file_id = str(uuid4())

    # ファイル拡張子を取得
    if "." in request.fileName and len(request.fileName.split(".")[-1]) > 0:
        file_extension = request.fileName.split(".")[-1].lower()
    else:
        # 拡張子がない場合は、contentTypeから推測
        content_type_to_extension = {
            "video/mp4": "mp4",
            "video/quicktime": "mov",
            "video/x-msvideo": "avi",
            "video/webm": "webm",
        }
        file_extension = content_type_to_extension.get(request.contentType, "mp4")
        logger.warning(
            f"No file extension found in '{request.fileName}', using '{file_extension}' based on content type"
        )

    try:
        # Validate GCS configuration
        settings.validate_gcs_config()

        # Check if GCS_BUCKET_NAME is not empty
        if not settings.gcs_bucket_name:
            logger.error(
                f"GCS_BUCKET_NAME is empty or not set. Current value: '{settings.gcs_bucket_name}'"
            )
            raise ValueError("GCS_BUCKET_NAME is not configured")

        logger.info(f"Using GCS bucket: {settings.gcs_bucket_name}")

        # Storage clientを作成
        storage_client = storage.Client()
        bucket = storage_client.bucket(settings.gcs_bucket_name)

        # Blobのパスを作成
        blob_name = f"{settings.gcs_uploads_prefix}{file_id}.{file_extension}"
        blob = bucket.blob(blob_name)

        # 署名付きURLの有効期限（1日）
        expiration_timedelta = dt.timedelta(days=1)

        # クライアントから指定されたContent-Typeを使用
        content_type = request.contentType

        # 署名付きURLを生成（アップロード用）
        signed_url = generate_signed_url(
            blob,
            method="PUT",
            expiration=expiration_timedelta,
            content_type=content_type,
            settings=settings,
        )

        logger.info(f"Generated signed URL for file_id: {file_id}, blob: {blob_name}")
        logger.info(f"Content-Type: {content_type}")
        logger.debug(f"Signed URL: {signed_url}")

        return SignedUploadUrlResponse(uploadUrl=signed_url, fileId=file_id)

    except Exception as e:
        logger.error(f"Failed to generate signed URL: {e!s}")
        raise
