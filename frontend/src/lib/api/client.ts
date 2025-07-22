import {
  IVideoApiClient,
  ApiError
} from './interfaces'
import {
  AnalysisResult,
  SignedUploadUrlResponse,
  VideoSegment,
  GenerateVideoResponse,
  VideoMetadata,
  SignedUploadUrlResponseSchema,
  AnalysisResultSchema,
  GenerateVideoResponseSchema,
  VideoMetadataSchema,
  validateApiResponse
} from '@/lib/validation'
import { getErrorMessage } from '@/lib/error-handler'

async function fetchWithError(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: getErrorMessage('API_UNKNOWN_ERROR') }))
    throw new ApiError(response.status, error.message || response.statusText)
  }

  return response
}

/**
 * 動画処理APIクライアントの実装
 */
class VideoApiClient implements IVideoApiClient {
  async getSignedUploadUrl(fileName: string, fileSize: number): Promise<SignedUploadUrlResponse> {
    // Determine content type from file extension
    const contentTypeMap: Record<string, string> = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'webm': 'video/webm'
    }

    const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
    const contentType = contentTypeMap[fileExtension] || 'video/mp4'

    const response = await fetchWithError('/api/upload/init', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileSize, contentType }),
    })

    const data = await response.json()
    return validateApiResponse(SignedUploadUrlResponseSchema, data, 'getSignedUploadUrl')
  }

  // Upload video to Cloud Storage using signed URL
  async uploadVideo(uploadUrl: string, file: File, onProgress?: (progress: number) => void): Promise<void> {
    console.log('Uploading video to:', uploadUrl)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Set up progress event listener
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentage = (event.loaded / event.total) * 100
          onProgress(percentage)
        }
      })

      // Set up load event listener
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) {
            onProgress(100)
          }
          resolve()
        } else {
          console.error('Upload failed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText
          })
          reject(new ApiError(xhr.status, `${getErrorMessage('API_UPLOAD_FAILED')}: ${xhr.statusText} - ${xhr.responseText}`))
        }
      })

      // Set up error event listener
      xhr.addEventListener('error', () => {
        console.error('Network error during upload')
        reject(new Error(getErrorMessage('NETWORK_UPLOAD_ERROR')))
      })

      // Set up abort event listener
      xhr.addEventListener('abort', () => {
        reject(new Error(getErrorMessage('UPLOAD_ABORTED')))
      })

      // Open connection and send
      xhr.open('PUT', uploadUrl, true)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  }

  // Analyze video with AI
  async analyzeVideo(fileId: string, modelOptions?: { provider: string; modelKey: string }, signal?: AbortSignal): Promise<AnalysisResult> {
    const response = await fetchWithError(`/api/analyze/${fileId}`, {
      method: 'POST',
      body: modelOptions ? JSON.stringify(modelOptions) : undefined,
      signal
    })
    const data = await response.json()
    return validateApiResponse(AnalysisResultSchema, data, 'analyzeVideo')
  }

  async generateVideo(fileId: string, segments: VideoSegment[]): Promise<GenerateVideoResponse> {
    const response = await fetchWithError('/api/extract', {
      method: 'POST',
      body: JSON.stringify({ fileId, segments }),
    })

    const data = await response.json()
    return validateApiResponse(GenerateVideoResponseSchema, data, 'generateVideo')
  }

  async getVideoMetadata(fileId: string): Promise<VideoMetadata> {
    const response = await fetchWithError(`/api/videos/${fileId}/metadata`)
    const data = await response.json()
    return validateApiResponse(VideoMetadataSchema, data, 'getVideoMetadata')
  }
}

// シングルトンインスタンスをエクスポート
export const api: IVideoApiClient = new VideoApiClient()

// Re-export for convenience
export { ApiError } from './interfaces'
export type { IVideoApiClient } from './interfaces'