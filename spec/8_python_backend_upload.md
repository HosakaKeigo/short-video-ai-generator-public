# Python Backend Upload
Implement fast api backend.

This spec's goal is to make deployable Fast API with minum dependencies.

## Folder
Implement in `backend/` folder.

## Requirements
- /api/upload/init エンドポイントは、動画アップロードの初期化を行います。このエンドポイントは、ファイル名とコンテンツタイプを受け取り、Cloud Storageへの直接アップロード用の署名付きURLを生成します。同時に、一意のファイルIDを生成し、後続の処理で使用できるようにします。
- /api/analyze/{file_id} エンドポイントは、アップロードされた動画のAI解析を実行します。Vertex AI（Gemini API）を使用して動画を解析し、30秒ごとのセグメントに対してハイライトスコアを算出します。解析結果は構造化されたJSONフォーマットで返され、各セグメントのタイトル、説明、スコアが含まれます。
- /api/extract エンドポイントは、選択されたハイライトセグメントから新しい動画を生成します。複数のセグメントを結合し、適切なトランジションを適用した上で、最終的な動画ファイルを生成します。

今回は内部実装は省略し、FastAPIのエンドポイントを定義することに集中します。
interfaceは`frontend/`の`frontend/src/lib/api/interfaces.ts`に定義されているので、そちらを参考にしてください。


```dockerfile
# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app

# Install poetry
RUN pip install poetry
RUN poetry self add poetry-plugin-export

# Copy poetry files
COPY pyproject.toml poetry.lock* ./

# Copy application code
COPY . .

# Export dependencies to requirements.txt
RUN poetry export -f requirements.txt --output requirements.txt 

# Final stage
FROM python:3.12-slim

RUN apt-get update && apt-get install -y libcairo2 python3-dev libffi-dev

WORKDIR /app

# Copy files from builder
COPY --from=builder /app/ .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Compile bytecode to improve startup latency
# -q: Quiet mode 
# -b: Write legacy bytecode files (.pyc) alongside source
# -f: Force rebuild even if timestamps are up-to-date
RUN python -m compileall -q -b -f .

# Expose port
EXPOSE 8080

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```