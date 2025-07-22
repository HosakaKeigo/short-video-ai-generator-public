Add mermaid flow to visualize fronten d and backend interactions.

# アーキテクチャ概要

## システム構成図

```mermaid
graph TB
    subgraph "フロントエンド"
        A[Next.js App] --> B[Video Uploader]
        A --> C[Video Player]
        A --> D[Timeline Editor]
    end
    
    subgraph "バックエンド"
        E[FastAPI Server] --> F[Upload Service]
        E --> G[Analysis Service]
        E --> H[Extract Service]
    end
    
    subgraph "外部サービス"
        I[Google Cloud Storage]
        J[Vertex AI / Google AI]
    end
    
    A -->|API Call| E
    F -->|Store| I
    G -->|Analyze| J
    H -->|Read/Write| I
データフロー

動画アップロード

ユーザーが動画を選択
フロントエンドが署名付き URL を取得
ブラウザから GCS へ直接アップロード


AI 解析

アップロード完了後、解析 API を呼び出し
Vertex AI または Google AI で動画を解析
セグメントごとのスコアを返却


動画生成

選択されたセグメントを結合
新しい動画ファイルを生成
ダウンロード URL を返却