'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useVideoStore } from '@/stores/videoStore'
import { api } from '@/lib/api/client'
import { Beaker } from 'lucide-react'

export function FileIdBypass() {
  const [fileId, setFileId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { 
    setVideoFile, 
    setError, 
    analysisResult,
    setAnalysisResult,
    setIsAnalyzing
  } = useVideoStore()

  const handleBypass = async () => {
    if (!fileId.trim()) {
      setError('File IDを入力してください')
      return
    }

    try {
      setError(null)
      setIsLoading(true)

      // Create a mock video file object with the file ID
      // For testing, we'll use a test video URL or create a blob URL
      const mockVideoFile = {
        id: fileId,
        file: new File([''], 'test-video.mp4', { type: 'video/mp4' }),
        url: '', // Will be set to empty for now, VideoPlayer should handle missing video
        duration: 60 // Default duration
      }

      setVideoFile(mockVideoFile)
      setError(null)
    } catch (error) {
      console.error('Bypass error:', error)
      setError(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!fileId.trim()) {
      setError('File IDを入力してください')
      return
    }

    try {
      setError(null)
      setIsAnalyzing(true)

      const result = await api.analyzeVideo(fileId)
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis error:', error)
      setError(error instanceof Error ? error.message : '解析に失敗しました')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Beaker className="h-5 w-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-900">テストモード</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="File IDを入力（例: test-file-123）"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleBypass}
            disabled={isLoading || !fileId.trim()}
            variant="outline"
          >
            セット
          </Button>
        </div>

        {fileId && (
          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !fileId.trim() || !!analysisResult}
              className="w-full"
            >
              このFile IDで解析実行
            </Button>
          </div>
        )}

        <p className="text-xs text-yellow-700">
          開発用: アップロードをスキップして直接File IDを指定できます
        </p>
      </div>
    </div>
  )
}