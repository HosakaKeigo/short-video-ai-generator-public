# Backend Setup Guide

## Prerequisites
- Python 3.12+
- Poetry (for dependency management)
- FFmpeg (for video processing)

## Installation

### 1. Install Poetry
```bash
curl -sSL https://install.python-poetry.org | python3 -
export PATH="$HOME/.local/bin:$PATH"
```

### 2. Install Dependencies
```bash
cd backend
poetry install
```

### 3. Install FFmpeg (if not already installed)
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## Configuration

Create a `.env` file in the backend directory:
```bash
# Mock storage mode (uses local filesystem)
USE_MOCK_STORAGE=true
STORAGE_BASE_URL=http://localhost:8080/storage

# Google Cloud Storage (for production)
# GCS_BUCKET_NAME=your-bucket-name
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## Running the Server

### Development Mode
```bash
poetry run uvicorn main:app --reload --port 8080
```

### Alternative: Direct Python
```bash
poetry run python main.py
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/upload/init` - Initialize upload, get signed URL
- `POST /api/analyze/{file_id}` - Analyze video with AI
- `POST /api/extract` - Extract video segments
- `POST /storage/uploads/{file_id}` - Upload file (mock storage only)
- `GET /storage/*` - Access stored files (mock storage only)

## Testing

### Test upload initialization:
```bash
curl -X POST http://localhost:8080/api/upload/init \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.mp4", "fileSize": 1048576}'
```

### Test analysis:
```bash
curl -X POST http://localhost:8080/api/analyze/test-file-id
```

## Directory Structure
```
backend/
├── app/
│   ├── api/           # API endpoints (deprecated)
│   ├── models/        # Pydantic models
│   ├── services/      # Business logic
│   └── config.py      # Configuration
├── storage/           # Local file storage (created automatically)
│   ├── uploads/       # Uploaded videos
│   └── processed/     # Processed videos
├── main.py            # FastAPI application
├── pyproject.toml     # Poetry dependencies
└── Dockerfile         # Container configuration
```

## Troubleshooting

### Poetry not found
```bash
export PATH="$HOME/.local/bin:$PATH"
```

### FFmpeg not found
Make sure FFmpeg is installed and in your PATH:
```bash
which ffmpeg
```

### Port already in use
Change the port:
```bash
poetry run uvicorn main:app --reload --port 8081
```