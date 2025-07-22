2. **docs/ENVIRONMENT_VARIABLES.md を作成**

```markdown
# 環境変数設定ガイド

## 必須環境変数

### バックエンド (.env)

| 変数名 | 説明 | 例 | 必須 |
|--------|------|-----|------|
| `GOOGLE_CLOUD_PROJECT` | GCP プロジェクト ID | `my-project-123` | ✓ |
| `GCS_BUCKET_NAME` | Cloud Storage バケット名 | `video-storage-bucket` | ✓ |
| `GOOGLE_APPLICATION_CREDENTIALS` | サービスアカウントキーのパス | `./credentials/service-account.json` | ✓ |
| `GOOGLE_API_KEY` | Google AI API キー（オプション） | `AIza...` | - |
| `VERTEX_AI_MODEL` | 使用する Vertex AI モデル | `gemini-2.0-flash-exp` | ✓ |
| `CORS_ORIGINS` | 許可する CORS オリジン | `http://localhost:3000,https://yourdomain.com` | ✓ |
| `LOG_LEVEL` | ログレベル | `INFO`, `DEBUG`, `ERROR` | - |

### フロントエンド (.env.local)

| 変数名 | 説明 | 例 | 必須 |
|--------|------|-----|------|
| `NEXT_PUBLIC_API_URL` | バックエンド API の URL | `http://localhost:8000` | ✓ |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | 最大ファイルサイズ（MB） | `100` | - |