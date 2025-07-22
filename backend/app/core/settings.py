"""
Application settings using pydantic-settings
"""

import os
from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    # Application
    app_name: str = "AI Short Video Generator API"
    version: str = "0.1.0"
    debug: bool = Field(default=False, description="Debug mode")

    # Storage
    use_mock_storage: bool = Field(
        default=True, description="Use mock storage for local development"
    )
    storage_base_url: str = Field(
        default="http://localhost:8080/storage", description="Base URL for storage"
    )

    # Google Cloud Storage
    gcs_bucket_name: str = Field(default="", description="GCS bucket name")
    gcs_project_id: str = Field(default="", description="GCS project ID")
    gcs_uploads_prefix: str = Field(
        default="uploads/", description="Prefix for uploaded files"
    )
    gcs_processed_prefix: str = Field(
        default="processed/", description="Prefix for processed files"
    )

    # Google Cloud Authentication
    google_application_credentials: str = Field(
        default="", description="Path to service account JSON key file"
    )

    # AI Model configuration
    vertex_ai_model: str = Field(
        default="gemini-2.0-flash-lite-001", description="Default Vertex AI model"
    )
    google_ai_model: str = Field(
        default="gemini-2.0-flash-lite-001", description="Default Google AI model"
    )
    google_api_key: str = Field(default="", description="Google AI API key")

    # CORS
    cors_origins: list[str] = Field(default=["*"], description="Allowed CORS origins")

    # Model configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from comma-separated string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    def validate_gcs_config(self) -> None:
        """Validate GCS configuration when not using mock storage"""
        if not self.use_mock_storage:
            if not self.gcs_bucket_name:
                msg = "GCS_BUCKET_NAME environment variable is required when USE_MOCK_STORAGE is false"
                raise ValueError(msg)
            if not self.gcs_project_id:
                msg = "GCS_PROJECT_ID environment variable is required when USE_MOCK_STORAGE is false"
                raise ValueError(msg)

    def configure_google_auth(self) -> None:
        """Configure Google authentication environment variable if needed"""
        if self.google_application_credentials:
            # Set the environment variable for Google Cloud SDK
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = (
                self.google_application_credentials
            )

    @property
    def base_dir(self) -> Path:
        """Get base directory path"""
        return Path(__file__).parent.parent.parent

    @property
    def storage_root(self) -> Path:
        """Get storage root path"""
        return self.base_dir / "storage"

    @property
    def uploads_dir(self) -> Path:
        """Get uploads directory path"""
        path = self.storage_root / "uploads"
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def processed_dir(self) -> Path:
        """Get processed directory path"""
        path = self.storage_root / "processed"
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance"""
    settings = Settings()
    # Configure Google authentication environment variable
    settings.configure_google_auth()
    return settings


# Model configuration dictionary (moved from config.py)
MODEL_CONFIGS = {
    "providers": {
        "vertex_ai": {
            "name": "Vertex AI",
            "models": {
                "gemini-25-flash-lite": {
                    "id": "gemini-2.5-flash-lite-preview-06-17",
                    "name": "Gemini 2.5 Flash Lite (Preview)",
                    "description": "Fast and efficient model for video analysis",
                },
                "gemini-20-flash-lite": {
                    "id": "gemini-2.0-flash-lite-001",
                    "name": "Gemini 2.0 Flash Lite",
                    "description": "Stable lightweight model",
                },
            },
        },
        "google_ai": {
            "name": "Google AI",
            "models": {
                "gemini-25-flash-lite": {
                    "id": "gemini-2.5-flash-lite-preview-06-17",
                    "name": "Gemini 2.5 Flash Lite (Preview)",
                    "description": "Fast and efficient model via Google AI API",
                },
                "gemini-20-flash-exp": {
                    "id": "gemini-2.0-flash-exp",
                    "name": "Gemini 2.0 Flash (Experimental)",
                    "description": "Experimental features with Google AI",
                },
            },
        },
    }
}


def get_model_id(provider: str, model_key: str) -> str:
    """
    Get the actual model ID from the model configuration dictionary.

    Args:
        provider: The provider key (e.g., "vertex_ai", "google_ai")
        model_key: The model key (e.g., "gemini-25-flash-lite")

    Returns:
        The actual model ID string

    Raises:
        ValueError: If provider or model not found
    """
    if provider not in MODEL_CONFIGS["providers"]:
        msg = f"Provider '{provider}' not found"
        raise ValueError(msg)

    provider_models = MODEL_CONFIGS["providers"][provider]["models"]
    if model_key not in provider_models:
        msg = f"Model '{model_key}' not found for provider '{provider}'"
        raise ValueError(msg)

    return provider_models[model_key]["id"]
