Add error message map in `frontend/src/lib/error-handler.ts`

```typescript
const ERROR_MESSAGES: Record<string, { message: string; details?: string }> = {
  VIDEO_UPLOAD_ERROR: {
    message: '動画のアップロードに失敗しました',
    details: 'ファイルサイズやフォーマットを確認してください'
  },
  VIDEO_PROCESSING_ERROR: {
    message: '動画の処理中にエラーが発生しました',
    details: 'しばらく待ってから再度お試しください'
  },
  AI_ANALYSIS_ERROR: {
    message: 'AI解析でエラーが発生しました',
    details: 'AIサービスが一時的に利用できない可能性があります'
  },
  STORAGE_ERROR: {
    message: 'ストレージエラーが発生しました',
    details: 'ファイルの保存または読み込みに失敗しました'
  },
  NETWORK_ERROR: {
    message: 'ネットワークエラーが発生しました',
    details: 'インターネット接続を確認してください'
  }
}
```