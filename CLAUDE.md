# AI Short Video Generator

## 概要
動画をアップロードし、AIが30秒単位のハイライトを自動抽出、選択した箇所で動画を切り出してダウンロードできるWebアプリケーション。

## 現在の実装状況
- ✅ フロントエンド・バックエンドの分離（モノレポ構成）
- ✅ Google Cloud Storage統合（署名付きURL）
- ✅ Gemini APIによる動画解析
- ✅ タイムライン表示とインタラクション
- ✅ 動画切り出し機能（サーバーサイド）
- ✅ ハイライトの時間調整機能

## 機能要件

### 1. 動画アップロード機能
- ドラッグ&ドロップまたはファイル選択で動画アップロード
- 対応形式: MP4, MOV, AVI, WebM
- 最大ファイルサイズ: 2GB
- アップロード進捗表示
- Google Cloud Storageへの直接アップロード（署名付きURL使用）
- 「変更」ボタンで動画の再選択と解析結果のリセット

### 2. AI解析機能
- 「AIで解析」ボタンクリックでGemini API呼び出し
- Gemini 2.0 Flash Liteモデル使用（Vertex AI経由）
- 動画を30秒単位のセグメントに分割して解析
- 各セグメントのハイライト度をスコアリング
- Pydantic構造化出力でレスポンスを保証
- レスポンス形式:
```json
{
  "highlights": [
    {
      "start": 0,
      "end": 30,
      "title": "オープニングシーン",
      "description": "導入部分の説明",
      "score": 0.85
    }
  ]
}
```

### 3. タイムライン表示
- 横軸: 時間軸（動画全体の長さ）
- ハイライト箇所を色付きバーで表示
- スコアに応じて色の濃淡を調整
- ホバー時にtitle/descriptionをツールチップ表示
- クリックで選択/選択解除（単一選択のみ）
- 現在の再生位置を赤いラインで表示
- クリックしたハイライトの開始位置に自動シーク

### 4. ハイライト編集機能
- 選択したハイライトの開始・終了時間を手動調整
- テキスト入力（m:ss形式または秒数）
- 上下ボタンで1秒単位の調整
- 開始時間を変更すると自動的にプレビュー位置が更新
- 時間範囲の検証（開始<終了、動画長以内）

### 5. 動画切り出し機能
- 選択したハイライトから動画生成
- サーバーサイドでFFmpegを使用（Google Cloud Storage統合）
- ファイル名: `<title>_<timestamp>.mp4`
- 編集した時間が切り出しに反映される

## 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **動画処理**: FFmpeg.wasm
- **UI Components**: shadcn/ui

### バックエンド
- **Runtime**: Python 3.12
- **Framework**: FastAPI
- **API**: REST API
- **AI**: Google Gemini API (Vertex AI)
- **動画処理**: FFmpeg (サーバーサイド)
- **依存管理**: Poetry

### インフラ
- **ストレージ**: Google Cloud Storage
- **認証**: Application Default Credentials / Service Account
- **ファイルアップロード**: 署名付きURL（直接アップロード）
- **CORS設定**: setup-gcs-cors.sh

## API設計

### POST /api/upload
署名付きアップロードURL取得
- Request: `{ fileName: string, fileSize: number, contentType: string }`
- Response: `{ uploadUrl: string, fileId: string }`

### POST /api/analyze/:fileId
AI解析実行
- Response: `{ highlights: Array<Highlight> }`

### POST /api/extract
動画切り出し
- Request: `{ fileId: string, segments: Array<{start: number, end: number}> }`
- Response: `{ downloadUrl: string }`

## プロジェクト構成
```
short-video-ai-generator/
├── frontend/           # Next.js フロントエンド
│   ├── src/
│   │   ├── app/       # App Router
│   │   ├── components/# UIコンポーネント
│   │   ├── lib/       # ユーティリティ
│   │   └── stores/    # Zustand状態管理
│   └── tests/         # Playwright E2Eテスト
├── backend/           # FastAPI バックエンド
│   ├── app/
│   │   ├── api/       # APIルート
│   │   ├── services/  # ビジネスロジック
│   │   └── models/    # Pydanticモデル
│   └── pyproject.toml # Poetry設定
└── spec/             # 仕様書・設計ドキュメント
```

## 環境変数

### バックエンド (.env)
```
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service_account_key.json
```

## セットアップ手順

1. Google Cloud Storageバケットの作成
2. CORS設定の適用: `./backend/setup-gcs-cors.sh`
3. サービスアカウントキーの配置
4. 依存関係のインストール:
   - Frontend: `npm install`
   - Backend: `poetry install`
5. 開発サーバーの起動:
   - Frontend: `npm run dev`
   - Backend: `poetry run uvicorn main:app --reload`

## 今後の拡張性
- 複数動画の結合機能
- カスタムハイライト条件設定
- 動画編集機能（トランジション、テキスト追加）
- ソーシャルメディア向け最適化（縦型動画対応）
- バッチ処理対応
- WebSocket通信での進捗リアルタイム更新