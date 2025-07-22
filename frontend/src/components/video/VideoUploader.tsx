'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useVideoStore } from '@/stores/videoStore'
import { api } from '@/lib/api/client'
import { validateVideoFile, getVideoDuration } from '@/lib/utils/video'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/lib/error-handler'

export function VideoUploader() {
  const [isDragActive, setIsDragActive] = useState(false)
  const { 
    setVideoFile, 
    setUploadProgress, 
    setError, 
    setIsLoading, 
    setAnalysisResult,
    uploadProgress,
    videoFile,
    isLoading 
  } = useVideoStore()

  const handleUpload = useCallback(async (file: File) => {
    try {
      setError(null)
      setIsLoading(true)
      
      // Validate file
      const validation = validateVideoFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
      
      // Get video duration
      const duration = await getVideoDuration(file)
      
      // Get signed URL for upload
      const { uploadUrl, fileId } = await api.getSignedUploadUrl(file.name, file.size)
      
      // Create video file object
      const videoFileObject = {
        id: fileId,
        file,
        url: URL.createObjectURL(file),
        duration
      }
      
      // Upload to Cloud Storage
      await api.uploadVideo(uploadUrl, file, (percentage) => {
        setUploadProgress({
          loaded: (file.size * percentage) / 100,
          total: file.size,
          percentage
        })
      })
      
      // Set video file in store
      setVideoFile(videoFileObject)
      setUploadProgress(null)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : getErrorMessage('VIDEO_UPLOAD_GENERAL'))
      setUploadProgress(null)
    } finally {
      setIsLoading(false)
    }
  }, [setVideoFile, setUploadProgress, setError, setIsLoading])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0])
    }
  }, [handleUpload])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxFiles: 1,
    multiple: false,
    disabled: isLoading || !!uploadProgress
  })

  if (videoFile) {
    return (
      <div className="w-full p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Film className="h-8 w-8 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{videoFile.file.name}</p>
            <p className="text-sm text-gray-500">
              {(videoFile.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              if (videoFile.url) {
                URL.revokeObjectURL(videoFile.url)
              }
              setVideoFile(null)
              setAnalysisResult(null) // Reset analysis results
            }}
          >
            変更
          </Button>
        </div>
      </div>
    )
  }

  const isUploading = isLoading || !!uploadProgress

  return (
    <div
      {...getRootProps()}
      className={cn(
        "w-full p-12 border-2 border-dashed rounded-lg transition-colors",
        isUploading
          ? "border-gray-200 bg-gray-50 cursor-not-allowed"
          : isDragActive 
            ? "border-blue-500 bg-blue-50 cursor-pointer" 
            : "border-gray-300 hover:border-gray-400 cursor-pointer"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <Upload className={cn(
          "h-12 w-12",
          isUploading 
            ? "text-gray-300" 
            : isDragActive 
              ? "text-blue-600" 
              : "text-gray-400"
        )} />
        
        <div className="text-center">
          <p className={cn(
            "text-lg font-medium",
            isUploading ? "text-gray-500" : "text-gray-900"
          )}>
            {isUploading ? "アップロード中..." : "動画をドラッグ&ドロップ"}
          </p>
          <p className={cn(
            "text-sm mt-1",
            isUploading ? "text-gray-400" : "text-gray-500"
          )}>
            {isUploading ? "しばらくお待ちください" : "または、クリックしてファイルを選択"}
          </p>
        </div>
        
        <div className="text-xs text-gray-400">
          対応形式: MP4, MOV, AVI, WebM（最大2GB）
        </div>
      </div>
      
      {uploadProgress && (
        <div className="mt-6 space-y-2">
          <Progress value={uploadProgress.percentage} className="w-full" />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{uploadProgress.percentage.toFixed(0)}%</span>
            <span>
              {(uploadProgress.loaded / 1024 / 1024).toFixed(1)} / {(uploadProgress.total / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        </div>
      )}
    </div>
  )
}