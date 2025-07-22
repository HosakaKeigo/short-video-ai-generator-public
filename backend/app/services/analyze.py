import logging
import os
import time

from google import genai
from google.genai.types import GenerateContentConfig, HttpOptions, Part
from pydantic import BaseModel

from app.core.settings import Settings
from app.models.schemas import AnalysisResult, Highlight
from app.services.analyze_google_ai import analyze_video_with_google_ai
from app.services.gcs_utils import get_file_info

logger = logging.getLogger(__name__)


# Geminiレスポンス用のPydanticモデル
class GeminiSegment(BaseModel):
    start: float
    end: float
    title: str
    description: str
    score: float


class GeminiResponse(BaseModel):
    segments: list[GeminiSegment]


async def analyze_video_service(file_id: str, settings: Settings) -> AnalysisResult:
    """
    動画のAI解析処理
    """
    try:
        # Google AI API キーが設定されている場合は Google AI API を使用
        google_api_key = os.environ.get("GOOGLE_API_KEY")
        if google_api_key:
            logger.info("Using Google AI API for video analysis")
            return await analyze_video_with_google_ai(file_id, google_api_key, settings)

        # それ以外は Vertex AI を使用
        logger.info("Using Vertex AI for video analysis")

        # Google Cloud プロジェクトIDを取得
        if not settings.gcs_project_id:
            raise ValueError("GCS_PROJECT_ID environment variable is not set")

        # Gemini クライアントを初期化
        client = genai.Client(
            http_options=HttpOptions(api_version="v1"),
            vertexai=True,
            project=settings.gcs_project_id,
            location="us-central1",
        )

        # Cloud Storage上の動画ファイルパスを構築
        file_extension, mime_type = await get_file_info(file_id, settings)
        gs_path = f"gs://{settings.gcs_bucket_name}/{settings.gcs_uploads_prefix}{file_id}{file_extension}"

        logger.info(f"Analyzing video with Vertex AI model: {settings.vertex_ai_model}")
        logger.info(f"Video location: {gs_path} (MIME: {mime_type})")

        # Geminiに動画解析をリクエスト
        prompt = """
        この動画を30秒ごとのセグメントに分割して分析してください。
        各セグメントについて以下の情報を提供してください：
        - start: セグメントの開始時間（秒）
        - end: セグメントの終了時間（秒）
        - title: そのセグメントの簡潔なタイトル（日本語）
        - description: セグメントの内容説明（日本語）
        - score: そのセグメントの重要度スコア（0.0〜1.0）

        重要度スコアは以下の基準で評価してください：
        - 視覚的に魅力的なシーン: +0.2
        - 重要な情報が含まれている: +0.3
        - アクションや動きがある: +0.2
        - 音声で重要な説明がある: +0.3
        """

        analysis_start = time.time()
        response = client.models.generate_content(
            model=settings.vertex_ai_model,
            contents=[
                Part.from_uri(
                    file_uri=gs_path,
                    mime_type=mime_type,
                ),
                prompt,
            ],
            config=GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiResponse,
                media_resolution="MEDIA_RESOLUTION_LOW",
            ),
        )
        analysis_time = time.time() - analysis_start
        logger.info(f"Vertex AI analysis completed in {analysis_time:.2f} seconds")

        # レスポンスを解析
        gemini_data = GeminiResponse.model_validate_json(response.text)
        highlights = [
            Highlight(
                start=segment.start,
                end=segment.end,
                title=segment.title,
                description=segment.description,
                score=segment.score,
            )
            for segment in gemini_data.segments
        ]

        return AnalysisResult(highlights=highlights)

    except Exception as e:
        logger.error(f"Error analyzing video: {e!s}")
        raise
