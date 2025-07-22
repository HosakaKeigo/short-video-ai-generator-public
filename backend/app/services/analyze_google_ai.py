import logging
import tempfile
import time
from pathlib import Path

import google.generativeai as genai
from pydantic import BaseModel

from app.core.settings import Settings
from app.models.schemas import AnalysisResult, Highlight
from app.services.gcs_utils import download_video_from_gcs, get_file_info

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


async def analyze_video_with_google_ai(
    file_id: str, api_key: str, settings: Settings
) -> AnalysisResult:
    """
    Google AI API を使用した動画解析処理
    """
    try:
        # Google AI API を設定
        genai.configure(api_key=api_key)

        # モデルを取得
        model = genai.GenerativeModel(settings.google_ai_model)
        logger.info(f"Using Google AI model: {settings.google_ai_model}")

        # 一時ディレクトリを作成
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # GCSから動画をダウンロード
            file_extension, mime_type = await get_file_info(file_id, settings)
            local_video_path = await download_video_from_gcs(
                file_id, file_extension, temp_path, settings
            )

            logger.info(f"Uploading video to Google AI Files API: {local_video_path}")

            # Google AI Files APIにアップロード
            file_ref = genai.upload_file(path=str(local_video_path))

            # ファイルの処理を待つ
            while file_ref.state.name == "PROCESSING":
                logger.info(f"File state: {file_ref.state.name}, name: {file_ref.name}")
                logger.info("Waiting for video to be processed...")
                time.sleep(5)
                file_ref = genai.get_file(name=file_ref.name)

            if file_ref.state.name != "ACTIVE":
                msg = f"File upload failed with state: {file_ref.state.name}"
                raise RuntimeError(msg)

            logger.info("Video upload completed")

            # プロンプト
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

            必ず以下のJSON形式で返答してください：
            {
                "segments": [
                    {
                        "start": 0,
                        "end": 30,
                        "title": "タイトル",
                        "description": "説明",
                        "score": 0.8
                    }
                ]
            }
            """

            # 動画解析を実行
            logger.info(f"Starting Google AI analysis for file: {file_ref.name}")
            analysis_start = time.time()
            response = model.generate_content(
                [file_ref, prompt],
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                ),
            )
            analysis_time = time.time() - analysis_start
            logger.info(f"Google AI analysis completed in {analysis_time:.2f} seconds")

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

            # アップロードしたファイルを削除
            try:
                genai.delete_file(file_ref.name)
                logger.info("Deleted uploaded file from Google AI")
            except Exception as e:
                logger.warning(f"Failed to delete file from Google AI: {e!s}")

            return AnalysisResult(highlights=highlights)

    except Exception as e:
        logger.exception(f"Error analyzing video with Google AI: {e!s}")
        raise
