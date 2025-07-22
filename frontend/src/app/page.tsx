'use client'

import { VideoUploader } from '@/components/video/VideoUploader'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { VideoTimeline } from '@/components/video/VideoTimeline'
import { AnalysisButton } from '@/components/analysis/AnalysisButton'
import { HighlightSelector } from '@/components/analysis/HighlightSelector'
import { ModelSelector } from '@/components/ModelSelector'
import { useVideoStore } from '@/stores/videoStore'
import { AlertCircle } from 'lucide-react'

export default function Home() {
  const { videoFile, analysisResult, error } = useVideoStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              AI Short Video Generator
            </h1>
            <p className="text-lg text-gray-600">
              動画をアップロードして、AIが自動的にハイライトを抽出します
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：アップロード＆プレビュー */}
            <div className="lg:col-span-2 space-y-6">
              {!videoFile ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <VideoUploader />
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <VideoUploader />
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <VideoPlayer />
                  </div>
                  
                  {!analysisResult && (
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                      <ModelSelector />
                      <AnalysisButton />
                    </div>
                  )}
                  
                  {analysisResult && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">タイムライン</h2>
                        <AnalysisButton isRegenerate />
                      </div>
                      <VideoTimeline />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 右側：ハイライト選択 */}
            <div className="lg:col-span-1">
              {analysisResult && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <HighlightSelector />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}