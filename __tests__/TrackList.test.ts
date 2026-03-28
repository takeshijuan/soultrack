import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeTime } from '@/components/TrackList'

// Mock useTranslations return value — just returns the key + interpolated params
const mockT = ((key: string, params?: Record<string, unknown>) => {
  if (params?.count !== undefined) return `${key}:${params.count}`
  return key
}) as ReturnType<typeof import('next-intl')['useTranslations']>

describe('formatRelativeTime', () => {
  const NOW = 1711612800000 // fixed timestamp

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty string for falsy createdAt', () => {
    expect(formatRelativeTime(0, mockT)).toBe('')
  })

  it('returns timeJustNow for <60 seconds ago', () => {
    expect(formatRelativeTime(NOW - 30_000, mockT)).toBe('timeJustNow')
  })

  it('returns timeMinutesAgo for 1-59 minutes ago', () => {
    expect(formatRelativeTime(NOW - 300_000, mockT)).toBe('timeMinutesAgo:5')
    expect(formatRelativeTime(NOW - 60_000, mockT)).toBe('timeMinutesAgo:1')
    expect(formatRelativeTime(NOW - 3_540_000, mockT)).toBe('timeMinutesAgo:59')
  })

  it('returns timeHoursAgo for 1-23 hours ago', () => {
    expect(formatRelativeTime(NOW - 7_200_000, mockT)).toBe('timeHoursAgo:2')
    expect(formatRelativeTime(NOW - 3_600_000, mockT)).toBe('timeHoursAgo:1')
    expect(formatRelativeTime(NOW - 82_800_000, mockT)).toBe('timeHoursAgo:23')
  })

  it('returns timeDaysAgo for 1-6 days ago', () => {
    expect(formatRelativeTime(NOW - 172_800_000, mockT)).toBe('timeDaysAgo:2')
    expect(formatRelativeTime(NOW - 86_400_000, mockT)).toBe('timeDaysAgo:1')
    expect(formatRelativeTime(NOW - 518_400_000, mockT)).toBe('timeDaysAgo:6')
  })

  it('returns timeWeeksAgo for 7+ days ago', () => {
    expect(formatRelativeTime(NOW - 604_800_000, mockT)).toBe('timeWeeksAgo:1')
    expect(formatRelativeTime(NOW - 1_209_600_000, mockT)).toBe('timeWeeksAgo:2')
  })
})
