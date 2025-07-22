'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVideoStore } from '@/stores/videoStore'
import { formatTime } from '@/lib/utils/video'

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [localCurrentTime, setLocalCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  
  const { videoFile, seekToTime, setSeekToTime, setCurrentTime: setStoreCurrentTime } = useVideoStore()
  
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const updateTime = () => {
      setLocalCurrentTime(video.currentTime)
      setStoreCurrentTime(video.currentTime)
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    
    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    
    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [videoFile, setStoreCurrentTime])
  
  // Handle seek requests from timeline
  useEffect(() => {
    if (seekToTime !== null && videoRef.current) {
      videoRef.current.currentTime = seekToTime
      setSeekToTime(null) // Reset seek request
    }
  }, [seekToTime, setSeekToTime])
  
  const togglePlayPause = () => {
    if (!videoRef.current || !videoFile?.url) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }
  
  const skip = (seconds: number) => {
    if (!videoRef.current || !videoFile?.url) return
    videoRef.current.currentTime = Math.max(0, Math.min(
      videoRef.current.currentTime + seconds,
      videoRef.current.duration
    ))
  }
  
  const toggleMute = () => {
    if (!videoRef.current || !videoFile?.url) return
    
    if (isMuted) {
      videoRef.current.volume = volume
      setIsMuted(false)
    } else {
      setVolume(videoRef.current.volume)
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoFile?.url) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    videoRef.current.currentTime = percentage * videoRef.current.duration
  }
  
  if (!videoFile) return null
  
  return (
    <div className="w-full space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoFile.url}
          className="w-full h-auto max-h-[500px]"
          onClick={togglePlayPause}
        />
      </div>
      
      <div className="space-y-2">
        {/* Progress bar */}
        <div 
          className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="absolute h-full bg-blue-600 rounded-full"
            style={{ width: `${(localCurrentTime / videoFile.duration) * 100}%` }}
          />
        </div>
        
        {/* Time display */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatTime(localCurrentTime)}</span>
          <span>{formatTime(videoFile.duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(-10)}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(10)}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}