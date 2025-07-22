'use client'

import { Sparkles, Loader2, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVideoStore } from '@/stores/videoStore'
import { api } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/lib/error-handler'

interface AnalysisButtonProps {
  isRegenerate?: boolean
}

export function AnalysisButton({ isRegenerate = false }: AnalysisButtonProps) {
  const {
    videoFile,
    selectedModel,
    isAnalyzing,
    setIsAnalyzing,
    setAnalysisResult,
    setError,
    setAbortController,
    cancelAnalysis
  } = useVideoStore()
  
  const handleAnalyze = async () => {
    if (!videoFile) return
    
    if (!selectedModel) {
      setError(getErrorMessage('AI_MODEL_SELECTION_ERROR'))
      return
    }
    
    try {
      setError(null)
      setIsAnalyzing(true)
      
      // Create abort controller for this analysis
      const controller = new AbortController()
      setAbortController(controller)
      
      // Call AI analysis API with selected model
      const result = await api.analyzeVideo(videoFile.id, {
        provider: selectedModel.provider,
        modelKey: selectedModel.modelKey
      }, controller.signal)
      setAnalysisResult(result)
      
    } catch (error) {
      console.error('Analysis error:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        setError('解析がキャンセルされました')
      } else {
        setError(error instanceof Error ? error.message : getErrorMessage('AI_ANALYSIS_GENERAL'))
      }
    } finally {
      setIsAnalyzing(false)
      setAbortController(null)
    }
  }
  
  if (!videoFile) return null
  
  if (isAnalyzing) {
    return (
      <div className={cn("flex gap-2", !isRegenerate && "w-full")}>
        <Button
          disabled
          size={isRegenerate ? "default" : "lg"}
          variant={isRegenerate ? "outline" : "default"}
          className={cn(
            !isRegenerate && "flex-1",
            "cursor-not-allowed"
          )}
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          AI解析中...
        </Button>
        <Button
          onClick={cancelAnalysis}
          size={isRegenerate ? "default" : "lg"}
          variant="destructive"
          className="px-3"
          title="解析をキャンセル"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }
  
  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing}
      size={isRegenerate ? "default" : "lg"}
      variant={isRegenerate ? "outline" : "default"}
      className={cn(
        !isRegenerate && "w-full",
        isAnalyzing && "cursor-not-allowed"
      )}
    >
      {isRegenerate ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          再解析
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          AIで解析
        </>
      )}
    </Button>
  )
}