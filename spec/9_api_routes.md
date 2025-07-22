Please add Nest.js API routes for the FastAPI backend as specified in the requirements.

Here's the endpoints.

```

@app.post("/api/upload/init", response_model=SignedUploadUrlResponse)
async def init_upload(request: SignedUploadUrlRequest):
    """
    動画アップロードの初期化を行います。
    ファイル名とコンテンツタイプを受け取り、Cloud Storageへの直接アップロード用の
    署名付きURLを生成します。同時に、一意のファイルIDを生成します。
    """
    try:
        response = await init_upload_service(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/{file_id}", response_model=AnalysisResult)
async def analyze_video(file_id: str):
    """
    アップロードされた動画のAI解析を実行します。
    Vertex AI（Gemini API）を使用して動画を解析し、
    30秒ごとのセグメントに対してハイライトスコアを算出します。
    """
    try:
        response = await analyze_video_service(file_id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract", response_model=GenerateVideoResponse)
async def extract_video(request: ExtractRequest):
    """
    選択されたハイライトセグメントから新しい動画を生成します。
    複数のセグメントを結合し、適切なトランジションを適用した上で、
    最終的な動画ファイルを生成します。
    """
    try:
        response = await extract_video_service(request)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

Each API route corresponds to the requirements specified in the FastAPI backend. The routes handle video upload initialization, video analysis, and video extraction, returning appropriate responses or raising HTTP exceptions in case of errors.
Also implement mock responses mode depending on the environment variable `USE_MOCK_RESPONSES`.