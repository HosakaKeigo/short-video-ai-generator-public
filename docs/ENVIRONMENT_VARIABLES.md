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
| `BACKEND_API_URL` | バックエンド API の URL | `http://localhost:8000` | ✓ |
| `USE_MOCK_RESPONSES` | モックレスポンスを使用するかどうか | `true`, `false` | - |

## 設定例

### 開発環境

#### backend/.env
```env
GOOGLE_CLOUD_PROJECT=dev-project-123
GCS_BUCKET_NAME=dev-video-storage
GOOGLE_APPLICATION_CREDENTIALS=./credentials/dev-service-account.json
VERTEX_AI_MODEL=gemini-2.0-flash-exp
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=DEBUG
```

#### frontend/.env.local
```env
BACKEND_API_URL=http://localhost:8000
USE_MOCK_RESPONSES=false
```

### 本番環境

#### backend/.env
```env
GOOGLE_CLOUD_PROJECT=prod-project-456
GCS_BUCKET_NAME=prod-video-storage
GOOGLE_APPLICATION_CREDENTIALS=./credentials/prod-service-account.json
VERTEX_AI_MODEL=gemini-2.0-flash-exp
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
LOG_LEVEL=INFO
```

#### frontend/.env.local
```env
BACKEND_API_URL=https://api.your-domain.com
USE_MOCK_RESPONSES=false
```

## セットアップ手順

### 1. サービスアカウントの設定

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. IAM & Admin > Service Accounts でサービスアカウントを作成
3. 必要な権限を付与:
   - Storage Object Admin
   - Vertex AI User
4. キーを JSON 形式でダウンロード
5. `backend/credentials/` ディレクトリに配置

### 2. Cloud Storage バケットの作成

```bash
# バケットの作成
gsutil mb -p YOUR_PROJECT_ID gs://YOUR_BUCKET_NAME

# CORS 設定の適用
cd backend
./setup-gcs-cors.sh YOUR_BUCKET_NAME
```

### 3. 環境変数ファイルの作成

```bash
# バックエンド
cp backend/.env.example backend/.env
# 実際の値を編集

# フロントエンド
cp frontend/.env.local.example frontend/.env.local
# 実際の値を編集
```

## トラブルシューティング

### よくある問題

#### 認証エラー
- `GOOGLE_APPLICATION_CREDENTIALS` のパスが正しいか確認
- サービスアカウントに必要な権限があるか確認

#### CORS エラー
- `CORS_ORIGINS` に正しいフロントエンドの URL が設定されているか確認
- Cloud Storage の CORS 設定が適用されているか確認

#### API 接続エラー
- `BACKEND_API_URL` がバックエンドの実際のアドレスと一致しているか確認
- バックエンドが起動しているか確認
