/**
 * エラーメッセージの定義
 */
export const ERROR_MESSAGES = {
  // 動画アップロード関連
  VIDEO_UPLOAD_ERROR: {
    message: '動画のアップロードに失敗しました',
    details: 'ファイルサイズやフォーマットを確認してください'
  },
  VIDEO_UPLOAD_GENERAL: {
    message: 'アップロードに失敗しました',
    details: 'しばらく待ってから再度お試しください'
  },
  VIDEO_FORMAT_ERROR: {
    message: 'サポートされていないファイル形式です。MP4, MOV, AVI, WebMのみ対応しています。',
    details: ''
  },
  VIDEO_SIZE_ERROR: {
    message: 'ファイルサイズが大きすぎます。2GB以下のファイルをアップロードしてください。',
    details: ''
  },

  // AI解析関連
  AI_ANALYSIS_ERROR: {
    message: 'AI解析でエラーが発生しました',
    details: 'AIサービスが一時的に利用できない可能性があります'
  },
  AI_ANALYSIS_GENERAL: {
    message: 'AI解析に失敗しました',
    details: 'しばらく待ってから再度お試しください'
  },
  AI_MODEL_SELECTION_ERROR: {
    message: 'AIモデルを選択してください',
    details: ''
  },

  // 動画生成関連
  VIDEO_GENERATION_ERROR: {
    message: '動画生成に失敗しました',
    details: '選択したハイライトを確認してください'
  },
  
  // 動画処理関連
  VIDEO_PROCESSING_ERROR: {
    message: '動画の処理中にエラーが発生しました',
    details: 'しばらく待ってから再度お試しください'
  },

  // ストレージ関連
  STORAGE_ERROR: {
    message: 'ストレージエラーが発生しました',
    details: 'ファイルの保存または読み込みに失敗しました'
  },

  // ネットワーク関連
  NETWORK_ERROR: {
    message: 'ネットワークエラーが発生しました',
    details: 'インターネット接続を確認してください'
  },
  NETWORK_UPLOAD_ERROR: {
    message: 'Network error during upload',
    details: 'Please check your internet connection'
  },
  UPLOAD_ABORTED: {
    message: 'Upload aborted',
    details: ''
  },

  // API関連エラー（英語）
  API_UNKNOWN_ERROR: {
    message: 'Unknown error',
    details: ''
  },
  API_UPLOAD_FAILED: {
    message: 'Upload failed',
    details: ''
  },
  API_ANALYSIS_FAILED: {
    message: 'Analysis failed',
    details: ''
  },
  API_EXTRACT_FAILED: {
    message: 'Extract failed',
    details: ''
  },
  API_UPLOAD_INIT_FAILED: {
    message: 'Upload initialization failed',
    details: ''
  },
  API_INTERNAL_ERROR: {
    message: 'Internal server error',
    details: ''
  },
  API_MODELS_FETCH_ERROR: {
    message: 'Failed to fetch models',
    details: ''
  },
  API_INVALID_RESPONSE: {
    message: 'Invalid response from server',
    details: 'The server returned an unexpected response format'
  },

  // 一般的なエラー
  GENERAL_ERROR: {
    message: 'エラーが発生しました',
    details: '申し訳ございません。予期しないエラーが発生しました。'
  },
  GENERAL_ERROR_OCCURRED: {
    message: 'An error occurred',
    details: ''
  }
} as const

/**
 * エラータイプの定義
 */
export type ErrorType = keyof typeof ERROR_MESSAGES

/**
 * エラーメッセージを取得する
 */
export function getErrorMessage(type: ErrorType): string {
  const error = ERROR_MESSAGES[type]
  return error.details ? `${error.message} ${error.details}` : error.message
}

/**
 * エラーメッセージオブジェクトを取得する
 */
export function getError(type: ErrorType) {
  return ERROR_MESSAGES[type]
}

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public originalError?: unknown
  ) {
    super(getErrorMessage(type))
    this.name = 'AppError'
  }
}

/**
 * エラーをログに記録する
 */
export function logError(error: unknown, context?: string) {
  if (context) {
    console.error(`[${context}]`, error)
  } else {
    console.error(error)
  }
}