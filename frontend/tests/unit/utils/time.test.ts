import { describe, it, expect } from 'vitest'
import {
  parseTimeInput,
  isTimeWithinDuration,
  isValidTimeRange,
  validateTimeValue,
  adjustTimeByDelta,
  type TimeRange
} from '@/lib/utils/time'

describe('parseTimeInput', () => {
  describe('valid inputs', () => {
    it('should parse "m:ss" format correctly', () => {
      expect(parseTimeInput('1:23')).toEqual({
        isValid: true,
        seconds: 83 // 1*60 + 23
      })

      expect(parseTimeInput('0:45')).toEqual({
        isValid: true,
        seconds: 45
      })

      expect(parseTimeInput('12:34')).toEqual({
        isValid: true,
        seconds: 754 // 12*60 + 34
      })
    })

    it('should parse "mm:ss" format correctly', () => {
      expect(parseTimeInput('10:00')).toEqual({
        isValid: true,
        seconds: 600
      })

      expect(parseTimeInput('59:59')).toEqual({
        isValid: true,
        seconds: 3599
      })
    })

    it('should parse seconds-only format', () => {
      expect(parseTimeInput('0')).toEqual({
        isValid: true,
        seconds: 0
      })

      expect(parseTimeInput('60')).toEqual({
        isValid: true,
        seconds: 60
      })

      expect(parseTimeInput('3600')).toEqual({
        isValid: true,
        seconds: 3600
      })
    })
  })

  describe('invalid inputs', () => {
    it('should reject empty input', () => {
      expect(parseTimeInput('')).toEqual({
        isValid: false,
        seconds: null,
        error: 'Time cannot be empty'
      })

      expect(parseTimeInput('  ')).toEqual({
        isValid: false,
        seconds: null,
        error: 'Time cannot be empty'
      })
    })

    it('should reject seconds >= 60 in time format', () => {
      expect(parseTimeInput('1:60')).toEqual({
        isValid: false,
        seconds: null,
        error: 'Seconds must be less than 60'
      })

      expect(parseTimeInput('0:99')).toEqual({
        isValid: false,
        seconds: null,
        error: 'Seconds must be less than 60'
      })
    })

    it('should reject invalid formats', () => {
      expect(parseTimeInput('1:2')).toEqual({
        isValid: false,
        seconds: null,
        error: 'Invalid time format. Use "m:ss" or seconds'
      })

      expect(parseTimeInput('1:234')).toEqual({
        isValid: false,
        seconds: null,
        error: 'Invalid time format. Use "m:ss" or seconds'
      })

      expect(parseTimeInput('abc')).toEqual({
        isValid: false,
        seconds: null,
        error: 'Invalid time format. Use "m:ss" or seconds'
      })

      expect(parseTimeInput('1.5')).toEqual({
        isValid: false,
        seconds: null,
        error: 'Invalid time format. Use "m:ss" or seconds'
      })

      expect(parseTimeInput('1:2:3')).toEqual({
        isValid: false,
        seconds: null,
        error: 'Invalid time format. Use "m:ss" or seconds'
      })
    })
  })
})

describe('isTimeWithinDuration', () => {
  it('should return true for valid times', () => {
    expect(isTimeWithinDuration(0, 100)).toBe(true)
    expect(isTimeWithinDuration(50, 100)).toBe(true)
    expect(isTimeWithinDuration(100, 100)).toBe(true)
  })

  it('should return false for invalid times', () => {
    expect(isTimeWithinDuration(-1, 100)).toBe(false)
    expect(isTimeWithinDuration(101, 100)).toBe(false)
    expect(isTimeWithinDuration(150, 100)).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(isTimeWithinDuration(0, 0)).toBe(true)
    expect(isTimeWithinDuration(1, 0)).toBe(false)
  })
})

describe('isValidTimeRange', () => {
  it('should return true for valid ranges', () => {
    expect(isValidTimeRange(0, 10)).toBe(true)
    expect(isValidTimeRange(5, 10)).toBe(true)
    expect(isValidTimeRange(0, 1)).toBe(true)
  })

  it('should return false for invalid ranges', () => {
    expect(isValidTimeRange(10, 10)).toBe(false)
    expect(isValidTimeRange(10, 5)).toBe(false)
    expect(isValidTimeRange(100, 50)).toBe(false)
  })
})

describe('validateTimeValue', () => {
  const videoDuration = 120 // 2 minutes

  describe('start time validation', () => {
    it('should accept valid start times', () => {
      const range: TimeRange = { start: 30, end: 60 }

      expect(validateTimeValue(0, 'start', range, videoDuration)).toBe(0)
      expect(validateTimeValue(20, 'start', range, videoDuration)).toBe(20)
      expect(validateTimeValue(59, 'start', range, videoDuration)).toBe(59)
    })

    it('should reject invalid start times', () => {
      const range: TimeRange = { start: 30, end: 60 }

      // Negative time
      expect(validateTimeValue(-1, 'start', range, videoDuration)).toBeNull()

      // Beyond video duration
      expect(validateTimeValue(121, 'start', range, videoDuration)).toBeNull()

      // Equal to or after end time
      expect(validateTimeValue(60, 'start', range, videoDuration)).toBeNull()
      expect(validateTimeValue(61, 'start', range, videoDuration)).toBeNull()
    })
  })

  describe('end time validation', () => {
    it('should accept valid end times', () => {
      const range: TimeRange = { start: 30, end: 60 }

      expect(validateTimeValue(31, 'end', range, videoDuration)).toBe(31)
      expect(validateTimeValue(90, 'end', range, videoDuration)).toBe(90)
      expect(validateTimeValue(120, 'end', range, videoDuration)).toBe(120)
    })

    it('should reject invalid end times', () => {
      const range: TimeRange = { start: 30, end: 60 }

      // Negative time
      expect(validateTimeValue(-1, 'end', range, videoDuration)).toBeNull()

      // Beyond video duration
      expect(validateTimeValue(121, 'end', range, videoDuration)).toBeNull()

      // Equal to or before start time
      expect(validateTimeValue(30, 'end', range, videoDuration)).toBeNull()
      expect(validateTimeValue(29, 'end', range, videoDuration)).toBeNull()
    })
  })
})

describe('adjustTimeByDelta', () => {
  const videoDuration = 120 // 2 minutes

  describe('adjusting start time', () => {
    it('should adjust start time correctly with positive delta', () => {
      const range: TimeRange = { start: 30, end: 60 }

      expect(adjustTimeByDelta(30, 10, 'start', range, videoDuration)).toBe(40)
      expect(adjustTimeByDelta(30, 29, 'start', range, videoDuration)).toBe(59)
    })

    it('should adjust start time correctly with negative delta', () => {
      const range: TimeRange = { start: 30, end: 60 }

      expect(adjustTimeByDelta(30, -10, 'start', range, videoDuration)).toBe(20)
      expect(adjustTimeByDelta(30, -30, 'start', range, videoDuration)).toBe(0)
    })

    it('should return null for invalid adjustments', () => {
      const range: TimeRange = { start: 30, end: 60 }

      // Would go negative
      expect(adjustTimeByDelta(30, -31, 'start', range, videoDuration)).toBeNull()

      // Would exceed end time
      expect(adjustTimeByDelta(30, 30, 'start', range, videoDuration)).toBeNull()

      // Would exceed video duration
      expect(adjustTimeByDelta(30, 100, 'start', range, videoDuration)).toBeNull()
    })
  })

  describe('adjusting end time', () => {
    it('should adjust end time correctly with positive delta', () => {
      const range: TimeRange = { start: 30, end: 60 }

      expect(adjustTimeByDelta(60, 10, 'end', range, videoDuration)).toBe(70)
      expect(adjustTimeByDelta(60, 60, 'end', range, videoDuration)).toBe(120)
    })

    it('should adjust end time correctly with negative delta', () => {
      const range: TimeRange = { start: 30, end: 60 }

      expect(adjustTimeByDelta(60, -10, 'end', range, videoDuration)).toBe(50)
      expect(adjustTimeByDelta(60, -29, 'end', range, videoDuration)).toBe(31)
    })

    it('should return null for invalid adjustments', () => {
      const range: TimeRange = { start: 30, end: 60 }

      // Would go below start time
      expect(adjustTimeByDelta(60, -30, 'end', range, videoDuration)).toBeNull()
      expect(adjustTimeByDelta(60, -31, 'end', range, videoDuration)).toBeNull()

      // Would exceed video duration
      expect(adjustTimeByDelta(60, 61, 'end', range, videoDuration)).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle adjustments at boundaries', () => {
      const range: TimeRange = { start: 0, end: 120 }

      // At start boundary
      expect(adjustTimeByDelta(0, 1, 'start', range, videoDuration)).toBe(1)
      expect(adjustTimeByDelta(0, -1, 'start', range, videoDuration)).toBeNull()

      // At end boundary
      expect(adjustTimeByDelta(120, -1, 'end', range, videoDuration)).toBe(119)
      expect(adjustTimeByDelta(120, 1, 'end', range, videoDuration)).toBeNull()
    })

    it('should handle minimal valid range', () => {
      const range: TimeRange = { start: 59, end: 60 }

      // Can't increase start
      expect(adjustTimeByDelta(59, 1, 'start', range, videoDuration)).toBeNull()

      // Can't decrease end
      expect(adjustTimeByDelta(60, -1, 'end', range, videoDuration)).toBeNull()

      // Can decrease start
      expect(adjustTimeByDelta(59, -1, 'start', range, videoDuration)).toBe(58)

      // Can increase end
      expect(adjustTimeByDelta(60, 1, 'end', range, videoDuration)).toBe(61)
    })
  })
})