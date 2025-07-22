'use client'
import { Trash2, Download, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useVideoStore } from '@/stores/videoStore'
import { formatTime, generateFileName } from '@/lib/utils/video'
import { parseTimeInput, validateTimeValue, adjustTimeByDelta } from '@/lib/utils/time'
import { api } from '@/lib/api/client'
import React, { useState } from 'react'
import { getErrorMessage } from '@/lib/error-handler'

export function HighlightSelector() {
  const {
    selectedHighlights,
    toggleHighlight,
    updateHighlightTimes,
    setSeekToTime,
    videoFile,
    isGenerating,
    setIsGenerating,
    setGeneratedVideoUrl,
    setError
  } = useVideoStore()
  
  const selectedItem = selectedHighlights.find(h => h.selected)
  const selectedDuration = selectedItem 
    ? (selectedItem.editedEnd ?? selectedItem.end) - (selectedItem.editedStart ?? selectedItem.start) 
    : 0
  
  const [startTimeInput, setStartTimeInput] = useState('')
  const [endTimeInput, setEndTimeInput] = useState('')
  
  // Update input values when selected item changes
  React.useEffect(() => {
    if (selectedItem) {
      setStartTimeInput(formatTime(selectedItem.editedStart ?? selectedItem.start))
      setEndTimeInput(formatTime(selectedItem.editedEnd ?? selectedItem.end))
      // Seek to the (edited) start time when selecting a highlight
      setSeekToTime(selectedItem.editedStart ?? selectedItem.start)
    }
  }, [selectedItem, setSeekToTime])
  
  
  const handleTimeChange = (field: 'start' | 'end', value: string) => {
    // Update input state
    if (field === 'start') {
      setStartTimeInput(value)
    } else {
      setEndTimeInput(value)
    }
  }
  
  const applyTimeChange = (field: 'start' | 'end') => {
    if (!selectedItem || !videoFile) return
    
    const inputValue = field === 'start' ? startTimeInput : endTimeInput
    const result = parseTimeInput(inputValue)
    
    if (!result.isValid || result.seconds === null) {
      // Reset to original value if invalid
      const originalTime = field === 'start' 
        ? (selectedItem.editedStart ?? selectedItem.start)
        : (selectedItem.editedEnd ?? selectedItem.end)
      
      if (field === 'start') {
        setStartTimeInput(formatTime(originalTime))
      } else {
        setEndTimeInput(formatTime(originalTime))
      }
      return
    }
    
    const currentRange = {
      start: selectedItem.editedStart ?? selectedItem.start,
      end: selectedItem.editedEnd ?? selectedItem.end
    }
    
    const validatedTime = validateTimeValue(
      result.seconds,
      field,
      currentRange,
      videoFile.duration
    )
    
    if (validatedTime !== null) {
      if (field === 'start') {
        updateHighlightTimes(selectedItem.id, validatedTime, currentRange.end)
        setStartTimeInput(formatTime(validatedTime))
        // Seek video to new start time
        setSeekToTime(validatedTime)
      } else {
        updateHighlightTimes(selectedItem.id, currentRange.start, validatedTime)
        setEndTimeInput(formatTime(validatedTime))
      }
    } else {
      // Reset to original value if validation failed
      if (field === 'start') {
        setStartTimeInput(formatTime(currentRange.start))
      } else {
        setEndTimeInput(formatTime(currentRange.end))
      }
    }
  }
  
  const adjustTime = (field: 'start' | 'end', delta: number) => {
    if (!selectedItem || !videoFile) return
    
    const currentRange = {
      start: selectedItem.editedStart ?? selectedItem.start,
      end: selectedItem.editedEnd ?? selectedItem.end
    }
    
    const currentTime = field === 'start' ? currentRange.start : currentRange.end
    
    const newTime = adjustTimeByDelta(
      currentTime,
      delta,
      field,
      currentRange,
      videoFile.duration
    )
    
    if (newTime !== null) {
      if (field === 'start') {
        updateHighlightTimes(selectedItem.id, newTime, currentRange.end)
        // Seek video to new start time
        setSeekToTime(newTime)
      } else {
        updateHighlightTimes(selectedItem.id, currentRange.start, newTime)
      }
    }
  }
  
  const handleGenerateVideo = async () => {
    if (!videoFile || !selectedItem) return
    
    try {
      setError(null)
      setIsGenerating(true)
      
      const segments = [{
        start: selectedItem.editedStart ?? selectedItem.start,
        end: selectedItem.editedEnd ?? selectedItem.end
      }]
      
      const { downloadUrl } = await api.generateVideo(videoFile.id, segments)
      setGeneratedVideoUrl(downloadUrl)
      
      // Fetch the video file to force download
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      // Create a proper download with correct filename
      const filename = generateFileName(selectedItem.title, Date.now())
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }, 100)
      
    } catch (error) {
      console.error('Generate video error:', error)
      setError(error instanceof Error ? error.message : getErrorMessage('VIDEO_GENERATION_ERROR'))
    } finally {
      setIsGenerating(false)
    }
  }
  
  if (!videoFile || selectedHighlights.length === 0) return null
  
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">選択したハイライト</h3>
        {selectedItem && (
          <p className="text-sm text-gray-600">
            時間: {formatTime(selectedDuration)}
          </p>
        )}
      </div>
      
      {!selectedItem ? (
        <div className="text-center py-8 text-gray-500">
          タイムラインからハイライトを選択してください
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{selectedItem.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedItem.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleHighlight(selectedItem)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">開始時間</label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        value={startTimeInput}
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                        onBlur={() => applyTimeChange('start')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            applyTimeChange('start')
                            e.currentTarget.blur()
                          }
                        }}
                        placeholder="0:00"
                        className="h-8 text-sm flex-1"
                      />
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-6 p-0"
                          onClick={() => adjustTime('start', 1)}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-6 p-0"
                          onClick={() => adjustTime('start', -1)}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">終了時間</label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        value={endTimeInput}
                        onChange={(e) => handleTimeChange('end', e.target.value)}
                        onBlur={() => applyTimeChange('end')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            applyTimeChange('end')
                            e.currentTarget.blur()
                          }
                        }}
                        placeholder="0:00"
                        className="h-8 text-sm flex-1"
                      />
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-6 p-0"
                          onClick={() => adjustTime('end', 1)}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-6 p-0"
                          onClick={() => adjustTime('end', -1)}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  時間: {formatTime(selectedDuration)}
                </div>
              </div>
            </div>
          </div>
          
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerateVideo}
            disabled={isGenerating || !selectedItem}
          >
            {isGenerating ? (
              <>生成中...</>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                動画を生成してダウンロード
              </>
            )}
          </Button>
        </>
      )}
    </div>
  )
}