'use client'

import { useEffect, useRef, useState } from 'react'
import { useVideoStore } from '@/stores/videoStore'
import { formatTime } from '@/lib/utils/video'

interface TooltipInfo {
  x: number
  y: number
  title: string
  description: string
  score: number
  start: number
  end: number
  visible: boolean
}

export function VideoTimeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipInfo>({
    x: 0,
    y: 0,
    title: '',
    description: '',
    score: 0,
    start: 0,
    end: 0,
    visible: false
  })
  
  const { videoFile, selectedHighlights, toggleHighlight, setSeekToTime, currentTime } = useVideoStore()
  
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !videoFile) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const rect = containerRef.current.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = 100
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw timeline background
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 20, canvas.width, 60)
    
    // Draw time markers
    const duration = videoFile.duration
    const markerInterval = duration > 300 ? 60 : 30 // 60s intervals for long videos, 30s for short
    const numMarkers = Math.floor(duration / markerInterval)
    
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'
    
    for (let i = 0; i <= numMarkers; i++) {
      const time = i * markerInterval
      const x = (time / duration) * canvas.width
      
      // Draw marker line
      ctx.strokeStyle = '#d1d5db'
      ctx.beginPath()
      ctx.moveTo(x, 15)
      ctx.lineTo(x, 85)
      ctx.stroke()
      
      // Draw time label
      ctx.fillText(formatTime(time), x - 15, 10)
    }
    
    // Draw highlights
    selectedHighlights.forEach((highlight) => {
      const startX = (highlight.start / duration) * canvas.width
      const width = ((highlight.end - highlight.start) / duration) * canvas.width
      
      // Draw highlight bar with gradient
      const alpha = highlight.score
      const baseColor = highlight.selected ? '59, 130, 246' : '99, 102, 241' // blue variations
      
      // Create gradient
      const gradient = ctx.createLinearGradient(startX, 30, startX, 70)
      gradient.addColorStop(0, `rgba(${baseColor}, ${alpha * 0.9})`)
      gradient.addColorStop(1, `rgba(${baseColor}, ${alpha * 0.6})`)
      
      ctx.fillStyle = gradient
      ctx.fillRect(startX, 30, width, 40)
      
      // Draw score indicator on top
      ctx.fillStyle = `rgba(${baseColor}, 1)`
      ctx.fillRect(startX, 25, width, 5)
      
      // Draw border for selected highlights
      if (highlight.selected) {
        ctx.strokeStyle = `rgb(${baseColor})`
        ctx.lineWidth = 3
        ctx.strokeRect(startX, 25, width, 45)
      }
      
      // Add title text if space allows
      if (width > 60) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(startX, 30, width, 40)
        ctx.clip()
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 11px sans-serif'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 2
        ctx.fillText(highlight.title, startX + 5, 50, width - 10)
        
        ctx.restore()
      }
    })
    
    // Draw current playback position
    if (currentTime > 0) {
      const currentX = (currentTime / duration) * canvas.width
      
      // Draw playhead line
      ctx.strokeStyle = '#ef4444' // red
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(currentX, 0)
      ctx.lineTo(currentX, canvas.height)
      ctx.stroke()
      
      // Draw playhead indicator
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(currentX - 5, 0)
      ctx.lineTo(currentX + 5, 0)
      ctx.lineTo(currentX, 10)
      ctx.closePath()
      ctx.fill()
    }
    
  }, [videoFile, selectedHighlights, currentTime])
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !videoFile) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickTime = (x / rect.width) * videoFile.duration
    
    // Find clicked highlight
    const clickedHighlight = selectedHighlights.find(
      h => clickTime >= h.start && clickTime <= h.end
    )
    
    if (clickedHighlight) {
      // Seek to the start of the clicked highlight
      setSeekToTime(clickedHighlight.start)
      // Also toggle the highlight selection
      toggleHighlight(clickedHighlight)
    } else {
      // If clicked on timeline but not on a highlight, seek to that position
      setSeekToTime(clickTime)
    }
  }
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !videoFile) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const hoverTime = (x / rect.width) * videoFile.duration
    const y = e.clientY - rect.top
    
    // Find hovered highlight - check if mouse is within highlight area
    const hoveredHighlight = selectedHighlights.find(
      h => hoverTime >= h.start && hoverTime <= h.end && y >= 25 && y <= 70
    )
    
    if (hoveredHighlight) {
      const rect = canvasRef.current.getBoundingClientRect()
      setTooltip({
        x: e.clientX,
        y: rect.top - 10,
        title: hoveredHighlight.title,
        description: hoveredHighlight.description,
        score: hoveredHighlight.score,
        start: hoveredHighlight.start,
        end: hoveredHighlight.end,
        visible: true
      })
      canvasRef.current.style.cursor = 'pointer'
    } else {
      setTooltip(prev => ({ ...prev, visible: false }))
      canvasRef.current.style.cursor = 'default'
    }
  }
  
  const handleCanvasMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }
  
  if (!videoFile) return null
  
  return (
    <div className="relative w-full" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="w-full cursor-pointer"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
      />
      
      {tooltip.visible && (
        <div
          className="absolute z-50 pointer-events-none max-w-xs -translate-x-1/2"
          style={{ 
            left: `${(tooltip.start + (tooltip.end - tooltip.start) / 2) / videoFile!.duration * 100}%`,
            bottom: '110px'
          }}
        >
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl">
            <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-sm">{tooltip.title}</p>
              <span className="text-xs bg-blue-500 px-2 py-1 rounded">
                {Math.round(tooltip.score * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{tooltip.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatTime(tooltip.start)}</span>
              <span>〜</span>
              <span>{formatTime(tooltip.end)}</span>
            </div>
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gray-900"></div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>クリックしてハイライトを選択（1つのみ選択可能）</p>
        <p className="text-xs text-gray-500 mt-1">
          色の濃さはAIスコアの高さを表しています
        </p>
      </div>
    </div>
  )
}