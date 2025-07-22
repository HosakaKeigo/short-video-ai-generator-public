import { create } from 'zustand'
import {
  VideoFile,
  AnalysisResult,
  SelectedHighlight,
  UploadProgress
} from '@/lib/validation'
import { SelectedModel } from '@/types/models'

interface VideoStore {
  // Video file state
  videoFile: VideoFile | null
  setVideoFile: (file: VideoFile | null) => void

  // Video playback state
  currentTime: number
  setCurrentTime: (time: number) => void
  seekToTime: number | null
  setSeekToTime: (time: number | null) => void

  // Upload progress state
  uploadProgress: UploadProgress | null
  setUploadProgress: (progress: UploadProgress | null) => void

  // Analysis state
  analysisResult: AnalysisResult | null
  setAnalysisResult: (result: AnalysisResult | null) => void
  isAnalyzing: boolean
  setIsAnalyzing: (isAnalyzing: boolean) => void
  abortController: AbortController | null
  setAbortController: (controller: AbortController | null) => void
  cancelAnalysis: () => void

  // Model selection state
  selectedModel: SelectedModel | null
  setSelectedModel: (model: SelectedModel | null) => void

  // Selected highlights state
  selectedHighlights: SelectedHighlight[]
  toggleHighlight: (highlight: SelectedHighlight) => void
  clearSelectedHighlights: () => void
  reorderHighlights: (startIndex: number, endIndex: number) => void
  updateHighlightTimes: (highlightId: string, editedStart: number, editedEnd: number) => void

  // Video generation state
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
  generatedVideoUrl: string | null
  setGeneratedVideoUrl: (url: string | null) => void

  // Global loading and error state
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  error: string | null
  setError: (error: string | null) => void

  // Reset all state
  reset: () => void
}

const initialState = {
  videoFile: null,
  currentTime: 0,
  seekToTime: null,
  uploadProgress: null,
  analysisResult: null,
  isAnalyzing: false,
  abortController: null,
  selectedModel: null,
  selectedHighlights: [],
  isGenerating: false,
  generatedVideoUrl: null,
  isLoading: false,
  error: null,
}

export const useVideoStore = create<VideoStore>((set) => ({
  ...initialState,

  setVideoFile: (file) => set({ videoFile: file }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setSeekToTime: (time) => set({ seekToTime: time }),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  setAnalysisResult: (result) => {
    if (result) {
      // Convert highlights to SelectedHighlight format
      const selectedHighlights = result.highlights.map((highlight, index) => ({
        ...highlight,
        id: `highlight-${index}`,
        selected: false,
      }))
      set({
        analysisResult: result,
        selectedHighlights
      })
    } else {
      set({ analysisResult: null, selectedHighlights: [] })
    }
  },

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  setAbortController: (controller) => set({ abortController: controller }),

  cancelAnalysis: () => set((state) => {
    if (state.abortController) {
      state.abortController.abort()
    }
    return { isAnalyzing: false, abortController: null }
  }),

  setSelectedModel: (model) => set({ selectedModel: model }),

  toggleHighlight: (highlight) => set((state) => ({
    selectedHighlights: state.selectedHighlights.map((h) =>
      // Only allow single selection - deselect all others when selecting a new one
      h.id === highlight.id
        ? { ...h, selected: !h.selected }
        : { ...h, selected: false }
    ),
  })),

  clearSelectedHighlights: () => set((state) => ({
    selectedHighlights: state.selectedHighlights.map((h) => ({ ...h, selected: false })),
  })),

  reorderHighlights: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.selectedHighlights)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return { selectedHighlights: result }
  }),

  updateHighlightTimes: (highlightId, editedStart, editedEnd) => set((state) => ({
    selectedHighlights: state.selectedHighlights.map((h) =>
      h.id === highlightId
        ? { ...h, editedStart, editedEnd }
        : h
    ),
  })),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setGeneratedVideoUrl: (url) => set({ generatedVideoUrl: url }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))