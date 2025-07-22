import type {
  AnalysisResult,
  SignedUploadUrlResponse,
  VideoSegment,
  GenerateVideoResponse,
  VideoMetadata,
} from '@/lib/validation'

/**
 * APIクライアントのインターフェース定義
 */
export interface IVideoApiClient {
  /**
   * 署名付きアップロードURLを取得
   * @param fileName - ファイル名
   * @param fileSize - ファイルサイズ（バイト）
   * @returns アップロードURLとファイルID
   */
  getSignedUploadUrl(fileName: string, fileSize: number): Promise<SignedUploadUrlResponse>

  /**
   * Cloud Storageに動画をアップロード
   * @param uploadUrl - 署名付きアップロードURL
   * @param file - アップロードするファイル
   * @param onProgress - 進捗コールバック（0-100のパーセンテージ）
   */
  uploadVideo(uploadUrl: string, file: File, onProgress?: (progress: number) => void): Promise<void>

  /**
   * 動画をAIで解析
   * @param fileId - 動画ファイルID
   * @param modelOptions - 使用するAIモデルの指定（オプション）
   * @param signal - AbortSignalでキャンセル可能にする（オプション）
   * @returns 解析結果（ハイライト情報）
   */
  analyzeVideo(fileId: string, modelOptions?: { provider: string; modelKey: string }, signal?: AbortSignal): Promise<AnalysisResult>

  /**
   * 選択したハイライトから動画を生成
   * @param fileId - 動画ファイルID
   * @param segments - 生成するセグメント（開始・終了時刻）
   * @returns ダウンロードURL
   */
  generateVideo(fileId: string, segments: VideoSegment[]): Promise<GenerateVideoResponse>

  /**
   * 動画のメタデータを取得
   * @param fileId - 動画ファイルID
   * @returns 動画のメタデータ（長さ、解像度など）
   */
  getVideoMetadata(fileId: string): Promise<VideoMetadata>
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}