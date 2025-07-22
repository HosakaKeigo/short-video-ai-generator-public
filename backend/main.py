from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import MODEL_CONFIGS, Settings, get_settings
from app.models.schemas import (
    AnalysisResult,
    ExtractRequest,
    GenerateVideoResponse,
    ModelInfo,
    ModelsResponse,
    ProviderModels,
    SignedUploadUrlRequest,
    SignedUploadUrlResponse,
)
from app.services.analyze import analyze_video_service
from app.services.extract import extract_video_service
from app.services.upload import init_upload_service

# Get settings instance
settings = get_settings()

# FastAPI app instance
app = FastAPI(
    title=settings.app_name,
    description="API for AI-powered short video generation",
    version=settings.version,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---


@app.get("/health")
async def get_health():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}


@app.get("/api/v1/models", response_model=ModelsResponse)
async def get_models():
    """
    利用可能なAIモデルとプロバイダーの一覧を返します。
    各プロバイダーごとに利用可能なモデルのIDと説明を含みます。
    """
    try:
        # Convert the MODEL_CONFIGS dictionary to the response format
        response_data = {"providers": {}}

        for provider_key, provider_data in MODEL_CONFIGS["providers"].items():
            models = {}
            for model_key, model_data in provider_data["models"].items():
                models[model_key] = ModelInfo(
                    id=model_data["id"],
                    name=model_data["name"],
                    description=model_data["description"],
                )

            response_data["providers"][provider_key] = ProviderModels(
                name=provider_data["name"], models=models
            )

        return ModelsResponse(**response_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload/init", response_model=SignedUploadUrlResponse)
async def init_upload(
    request: SignedUploadUrlRequest,
    settings: Annotated[Settings, Depends(get_settings)],
):
    """
    動画アップロードの初期化を行います。
    ファイル名とコンテンツタイプを受け取り、Cloud Storageへの直接アップロード用の
    署名付きURLを生成します。同時に、一意のファイルIDを生成します。
    """
    try:
        response = await init_upload_service(request, settings)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/{file_id}", response_model=AnalysisResult)
async def analyze_video(
    file_id: str,
    settings: Annotated[Settings, Depends(get_settings)],
):
    """
    アップロードされた動画のAI解析を実行します。
    Vertex AI（Gemini API）を使用して動画を解析し、
    30秒ごとのセグメントに対してハイライトスコアを算出します。
    """
    try:
        response = await analyze_video_service(file_id, settings)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract", response_model=GenerateVideoResponse)
async def extract_video(
    request: ExtractRequest,
    settings: Annotated[Settings, Depends(get_settings)],
):
    """
    選択されたハイライトセグメントから新しい動画を生成します。
    複数のセグメントを結合し、適切なトランジションを適用した上で、
    最終的な動画ファイルを生成します。
    """
    try:
        response = await extract_video_service(request, settings)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Entry point for direct execution
if __name__ == "__main__":
    import os

    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
