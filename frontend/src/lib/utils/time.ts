/**
 * Time validation and parsing utilities
 */

export interface TimeValidationResult {
  isValid: boolean
  seconds: number | null
  error?: string
}

export interface TimeRange {
  start: number
  end: number
}

/**
 * Parse time input string to seconds
 * Supports formats: "1:23", "0:45", "123" (seconds only)
 */
export function parseTimeInput(timeStr: string): TimeValidationResult {
  if (!timeStr.trim()) {
    return { isValid: false, seconds: null, error: 'Time cannot be empty' }
  }

  // Try parsing as "m:ss" or "mm:ss" format
  const colonMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (colonMatch) {
    const [, minutes, seconds] = colonMatch
    const mins = parseInt(minutes)
    const secs = parseInt(seconds)

    if (secs >= 60) {
      return { isValid: false, seconds: null, error: 'Seconds must be less than 60' }
    }

    const totalSeconds = mins * 60 + secs
    return { isValid: true, seconds: totalSeconds }
  }

  // Try parsing as seconds only
  const secondsMatch = timeStr.match(/^(\d+)$/)
  if (secondsMatch) {
    const seconds = parseInt(secondsMatch[1])
    return { isValid: true, seconds }
  }

  return { isValid: false, seconds: null, error: 'Invalid time format. Use "m:ss" or seconds' }
}

/**
 * Validate if time is within video duration
 */
export function isTimeWithinDuration(time: number, duration: number): boolean {
  return time >= 0 && time <= duration
}

/**
 * Validate if time range is valid (start < end)
 */
export function isValidTimeRange(start: number, end: number): boolean {
  return start < end
}

/**
 * Validate and adjust time value
 * Returns the validated time or null if invalid
 */
export function validateTimeValue(
  newTime: number,
  field: 'start' | 'end',
  currentRange: TimeRange,
  videoDuration: number
): number | null {
  // Check if within video duration
  if (!isTimeWithinDuration(newTime, videoDuration)) {
    return null
  }

  // Check if maintains valid range
  if (field === 'start') {
    if (!isValidTimeRange(newTime, currentRange.end)) {
      return null
    }
  } else {
    if (!isValidTimeRange(currentRange.start, newTime)) {
      return null
    }
  }

  return newTime
}

/**
 * Calculate new time with bounds checking
 */
export function adjustTimeByDelta(
  currentTime: number,
  delta: number,
  field: 'start' | 'end',
  currentRange: TimeRange,
  videoDuration: number
): number | null {
  const newTime = currentTime + delta
  return validateTimeValue(newTime, field, currentRange, videoDuration)
}