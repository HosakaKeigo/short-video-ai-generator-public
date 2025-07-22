import asyncio
import logging
import tempfile
import time
from datetime import timedelta
from pathlib import Path

from google.cloud import storage

from app.core.settings import Settings
from app.models.schemas import ExtractRequest, GenerateVideoResponse
from app.services.gcs_utils import generate_signed_url

logger = logging.getLogger(__name__)


async def extract_video_service(
    request: ExtractRequest, settings: Settings
) -> GenerateVideoResponse:
    """
    動画切り出し処理
    選択された単一セグメントを切り出す
    """
    # セグメントが空の場合はエラー
    if not request.segments:
        raise ValueError("No segments provided")

    # 複数セグメントはサポートしない
    if len(request.segments) > 1:
        raise ValueError(
            "Multiple segments are not supported. Please select only one segment."
        )

    try:
        segment = request.segments[0]
        output_filename = (
            f"{request.fileId}_extracted_{int(segment.start)}_{int(segment.end)}.mp4"
        )

        # Google Cloud Storageを使用する場合
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # GCSから動画をダウンロード
            storage_client = storage.Client()
            bucket = storage_client.bucket(settings.gcs_bucket_name)

            # 入力ファイルを探す（複数の拡張子を試す）
            input_blob = None
            for ext in ["mp4", "mov", "avi", "webm"]:
                blob_name = f"{settings.gcs_uploads_prefix}{request.fileId}.{ext}"
                blob = bucket.blob(blob_name)
                if blob.exists():
                    input_blob = blob
                    input_filename = f"{request.fileId}.{ext}"
                    break

            if not input_blob:
                raise FileNotFoundError(
                    f"Input file not found in GCS for fileId: {request.fileId}"
                )

            # 一時ファイルにダウンロード
            input_path = temp_path / input_filename
            logger.info(f"Downloading from GCS: {input_blob.name}")
            download_start = time.time()
            input_blob.download_to_filename(str(input_path))
            download_time = time.time() - download_start
            file_size_mb = input_path.stat().st_size / (1024 * 1024)
            logger.info(
                f"Download completed: {input_blob.name} ({file_size_mb:.2f} MB) in {download_time:.2f} seconds"
            )

            # 出力パス
            output_path = temp_path / output_filename

            # FFmpegで動画を切り出し
            logger.info(f"Extracting video segment: {segment.start}s - {segment.end}s")
            extract_start = time.time()
            await extract_video_segment(
                str(input_path), str(output_path), segment.start, segment.end
            )
            extract_time = time.time() - extract_start
            logger.info(f"Video extraction completed in {extract_time:.2f} seconds")

            # 処理済み動画をGCSにアップロード
            output_blob_name = f"{settings.gcs_processed_prefix}{output_filename}"
            output_blob = bucket.blob(output_blob_name)

            logger.info(f"Uploading to GCS: {output_blob_name}")
            upload_start = time.time()
            output_blob.upload_from_filename(str(output_path))
            upload_time = time.time() - upload_start
            output_size_mb = output_path.stat().st_size / (1024 * 1024)
            logger.info(
                f"Upload completed: {output_blob_name} ({output_size_mb:.2f} MB) in {upload_time:.2f} seconds"
            )

            # 署名付きダウンロードURLを生成
            download_url = generate_signed_url(
                output_blob,
                method="GET",
                expiration=timedelta(days=1),
                settings=settings,
            )

            return GenerateVideoResponse(downloadUrl=download_url)

    except Exception as e:
        logger.exception(f"Video extraction failed: {e!s}")
        msg = f"Video extraction failed: {e!s}"
        raise RuntimeError(msg)


async def extract_video_segment(
    input_path: str, output_path: str, start: float, end: float
) -> None:
    """
    FFmpegを使用して動画セグメントを切り出す
    """
    duration = end - start
    logger.info(f"FFmpeg extraction: duration={duration:.2f}s")

    cmd = [
        "ffmpeg",
        "-y",  # 上書き確認なし
        "-ss",
        str(start),  # 開始時刻
        "-to",
        str(end),  # 終了時刻
        "-i",
        input_path,  # 入力ファイル
        "-c",
        "copy",  # ストリームコピー（高速、品質劣化なし）
        "-avoid_negative_ts",
        "make_zero",  # タイムスタンプの調整
        output_path,  # 出力ファイル
    ]

    # FFmpegコマンドの実行
    logger.debug(f"FFmpeg command: {' '.join(cmd)}")
    process = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )

    _, stderr = await process.communicate()

    if process.returncode != 0:
        error_message = stderr.decode("utf-8")
        logger.error(f"FFmpeg failed: {error_message}")
        raise RuntimeError(f"FFmpeg error: {error_message}")

    logger.info("FFmpeg extraction successful")
