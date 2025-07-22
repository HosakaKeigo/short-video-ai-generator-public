"""Test pydantic-settings integration"""

import pytest
from unittest.mock import patch
from app.core.settings import Settings, get_settings


def test_settings_from_env():
    """Test that settings load from environment variables"""
    with patch.dict(
        "os.environ",
        {
            "GCS_BUCKET_NAME": "test-bucket",
            "GCS_PROJECT_ID": "test-project",
            "CORS_ORIGINS": '["http://localhost:3000","https://example.com"]',
            "DEBUG": "true",
        },
        clear=True,
    ):
        # Create settings without loading .env file
        settings = Settings(_env_file=None)
        assert settings.gcs_bucket_name == "test-bucket"
        assert settings.gcs_project_id == "test-project"
        assert settings.cors_origins == ["http://localhost:3000", "https://example.com"]
        assert settings.debug is True


def test_settings_defaults():
    """Test default settings values"""
    # Create settings without loading .env file
    settings = Settings(_env_file=None)
    assert settings.app_name == "AI Short Video Generator API"
    assert settings.use_mock_storage is True
    assert settings.vertex_ai_model == "gemini-2.0-flash-lite-001"


def test_settings_validation():
    """Test settings validation"""
    # Should not raise when mock storage is enabled
    settings = Settings(use_mock_storage=True, gcs_bucket_name="", gcs_project_id="")
    settings.validate_gcs_config()  # Should not raise

    # Should raise when mock storage is disabled and GCS settings are missing
    settings = Settings(use_mock_storage=False, gcs_bucket_name="", gcs_project_id="")
    with pytest.raises(ValueError, match="GCS_BUCKET_NAME"):
        settings.validate_gcs_config()


def test_get_settings_cached():
    """Test that get_settings returns cached instance"""
    settings1 = get_settings()
    settings2 = get_settings()
    assert settings1 is settings2  # Same instance due to @lru_cache


def test_settings_paths():
    """Test path properties"""
    settings = Settings()
    assert settings.base_dir.exists()
    assert settings.uploads_dir.exists()
    assert settings.processed_dir.exists()
    assert str(settings.uploads_dir).endswith("storage/uploads")
    assert str(settings.processed_dir).endswith("storage/processed")
