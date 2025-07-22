import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatTime, validateVideoFile, generateFileName, getVideoDuration } from '@/lib/utils/video'

describe('formatTime', () => {
  it('should format seconds correctly (less than 1 minute)', () => {
    expect(formatTime(45)).toBe('0:45')
    expect(formatTime(9)).toBe('0:09')
  })

  it('should format minutes and seconds correctly (less than 1 hour)', () => {
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(150)).toBe('2:30')
    expect(formatTime(599)).toBe('9:59')
  })

  it('should format hours, minutes and seconds correctly', () => {
    expect(formatTime(3600)).toBe('1:00:00')
    expect(formatTime(3665)).toBe('1:01:05')
    expect(formatTime(7323)).toBe('2:02:03')
  })

  it('should handle edge cases', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(59)).toBe('0:59')
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(3599)).toBe('59:59')
  })
})

describe('validateVideoFile', () => {
  it('should accept valid video files', () => {
    const validFile = new File([''], 'test.mp4', { type: 'video/mp4' })
    Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }) // 1MB

    const result = validateVideoFile(validFile)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should accept all supported video formats', () => {
    const formats = [
      { type: 'video/mp4', ext: 'mp4' },
      { type: 'video/quicktime', ext: 'mov' },
      { type: 'video/x-msvideo', ext: 'avi' },
      { type: 'video/webm', ext: 'webm' }
    ]

    formats.forEach(({ type, ext }) => {
      const file = new File([''], `test.${ext}`, { type })
      Object.defineProperty(file, 'size', { value: 1024 }) // 1KB
      
      const result = validateVideoFile(file)
      expect(result.valid).toBe(true)
    })
  })

  it('should reject unsupported file types', () => {
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' })
    
    const result = validateVideoFile(invalidFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('サポートされていないファイル形式')
  })

  it('should reject files larger than 2GB', () => {
    const largeFile = new File([''], 'test.mp4', { type: 'video/mp4' })
    Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 * 1024 }) // 3GB
    
    const result = validateVideoFile(largeFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('ファイルサイズが大きすぎます')
  })

  it('should accept files exactly 2GB', () => {
    const maxFile = new File([''], 'test.mp4', { type: 'video/mp4' })
    Object.defineProperty(maxFile, 'size', { value: 2 * 1024 * 1024 * 1024 }) // 2GB
    
    const result = validateVideoFile(maxFile)
    expect(result.valid).toBe(true)
  })
})

describe('generateFileName', () => {
  it('should generate filename with sanitized title and timestamp', () => {
    const timestamp = 1234567890
    const result = generateFileName('My Video Title', timestamp)
    expect(result).toBe('My_Video_Title_1234567890.mp4')
  })

  it('should handle Japanese characters', () => {
    const timestamp = 1234567890
    const result = generateFileName('私のビデオ', timestamp)
    expect(result).toBe('私のビデオ_1234567890.mp4')
  })

  it('should replace special characters with underscores', () => {
    const timestamp = 1234567890
    const result = generateFileName('Video@#$%Title!', timestamp)
    expect(result).toBe('Video____Title__1234567890.mp4')
  })

  it('should handle mixed characters', () => {
    const timestamp = 1234567890
    const result = generateFileName('Video タイトル 123', timestamp)
    expect(result).toBe('Video_タイトル_123_1234567890.mp4')
  })
})

describe('getVideoDuration', () => {
  // Mock window to undefined to trigger test environment path
  const originalWindow = global.window
  
  beforeEach(() => {
    // Set window to undefined to simulate server environment
    (global as any).window = undefined
  })

  afterEach(() => {
    // Restore window
    global.window = originalWindow
    vi.restoreAllMocks()
  })

  it('should return default duration in test environment', async () => {
    const file = new File([''], 'test.mp4', { type: 'video/mp4' })
    const duration = await getVideoDuration(file)
    expect(duration).toBe(180) // Default 3 minutes
  })

  it('should return default duration for non-video files', async () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' })
    const duration = await getVideoDuration(file)
    expect(duration).toBe(180)
  })

  it('should handle video element creation in browser environment', async () => {
    // Restore window for this test
    global.window = originalWindow

    // Mock document.createElement
    const mockVideo = {
      preload: '',
      src: '',
      duration: 120,
      onloadedmetadata: null as any,
      onerror: null as any
    }

    const originalCreateElement = document.createElement
    document.createElement = vi.fn(() => mockVideo as any)

    const file = new File([''], 'test.mp4', { type: 'video/mp4' })
    
    // Start the duration request
    const durationPromise = getVideoDuration(file)

    // Simulate successful metadata load
    setTimeout(() => {
      if (mockVideo.onloadedmetadata) {
        mockVideo.onloadedmetadata()
      }
    }, 10)

    const duration = await durationPromise
    expect(duration).toBe(120)

    // Restore mocks
    document.createElement = originalCreateElement
  })
})