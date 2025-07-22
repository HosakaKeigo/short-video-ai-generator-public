# バックエンドのユニットテスト実装
実装手順

backend/tests/conftest.py を作成

pythonimport pytest
import asyncio
from typing import AsyncGenerator
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(scope="session")
def event_loop():
    """イベントループのフィクスチャ"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def client():
    """テストクライアントのフィクスチャ"""
    return TestClient(app)

@pytest.fixture
def mock_gcs():
    """Google Cloud Storage のモック"""
    with patch("app.services.gcs_utils.storage.Client") as mock:
        yield mock

@pytest.fixture
def mock_vertex_ai():
    """Vertex AI のモック"""
    with patch("app.services.analyze.genai.Client") as mock:
        yield mock

@pytest.fixture
def sample_analysis_response():
    """サンプルの解析レスポンス"""
    return {
        "segments": [
            {
                "start": 0.0,
                "end": 30.0,
                "title": "オープニング",
                "description": "動画の導入部分",
                "score": 0.8
            },
            {
                "start": 30.0,
                "end": 60.0,
                "title": "メインコンテンツ",
                "description": "重要な内容",
                "score": 0.95
            }
        ]
    }

backend/tests/test_analyze.py を作成

pythonimport pytest
from unittest.mock import Mock, patch, AsyncMock
from app.services.analyze import analyze_video_service
from app.core.exceptions import AIAnalysisError
import json

@pytest.mark.asyncio
async def test_analyze_video_success(mock_vertex_ai, sample_analysis_response):
    """動画解析の正常系テスト"""
    # モックの設定
    mock_response = Mock()
    mock_response.text = json.dumps(sample_analysis_response)
    
    mock_model = Mock()
    mock_model.generate_content = Mock(return_value=mock_response)
    
    mock_vertex_ai.return_value.models = mock_model
    
    # get_file_info のモック
    with patch("app.services.analyze.get_file_info", return_value=(".mp4", "video/mp4")):
        # テスト実行
        result = await analyze_video_service("test-file-id")
    
    # 検証
    assert len(result.highlights) == 2
    assert result.highlights[0].title == "オープニング"
    assert result.highlights[1].score == 0.95

@pytest.mark.asyncio
async def test_analyze_video_with_google_ai():
    """Google AI API を使用した解析のテスト"""
    with patch.dict("os.environ", {"GOOGLE_API_KEY": "test-api-key"}):
        with patch("app.services.analyze.analyze_video_with_google_ai") as mock_google_ai:
            mock_google_ai.return_value = Mock(highlights=[])
            
            result = await analyze_video_service("test-file-id")
            
            mock_google_ai.assert_called_once_with("test-file-id", "test-api-key")

@pytest.mark.asyncio
async def test_analyze_video_error_handling():
    """エラーハンドリングのテスト"""
    with patch("app.services.analyze.genai.Client") as mock_client:
        mock_client.side_effect = Exception("AI service error")
        
        with pytest.raises(Exception) as exc_info:
            await analyze_video_service("test-file-id")
        
        assert "AI service error" in str(exc_info.value)

backend/tests/test_api.py を作成

pythonimport pytest
from fastapi import status

def test_health_endpoint(client):
    """ヘルスチェックエンドポイントのテスト"""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "healthy"}

def test_get_models_endpoint(client):
    """モデル一覧取得エンドポイントのテスト"""
    response = client.get("/api/v1/models")
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert "providers" in data
    assert "google" in data["providers"]
    assert "models" in data["providers"]["google"]

def test_init_upload_endpoint(client, mock_gcs):
    """アップロード初期化エンドポイントのテスト"""
    mock_blob = Mock()
    mock_blob.generate_signed_url.return_value = "https://storage.googleapis.com/signed-url"
    
    mock_bucket = Mock()
    mock_bucket.blob.return_value = mock_blob
    
    mock_gcs.return_value.bucket.return_value = mock_bucket
    
    response = client.post(
        "/api/upload/init",
        json={
            "fileName": "test.mp4",
            "contentType": "video/mp4"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "uploadUrl" in data
    assert "fileId" in data

def test_analyze_video_endpoint_not_found(client):
    """存在しないファイルの解析テスト"""
    with patch("app.services.analyze.analyze_video_service") as mock_analyze:
        mock_analyze.side_effect = FileNotFoundError("File not found")
        
        response = client.post("/api/analyze/non-existent-file")
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR