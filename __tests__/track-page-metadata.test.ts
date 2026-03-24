import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock KV — vi.hoisted ensures fn is available when vi.mock factory runs (hoisted)
const mockGetTrack = vi.hoisted(() => vi.fn())
vi.mock('@/lib/kv', () => ({
  getTrack: mockGetTrack,
  isTrackInLibrary: vi.fn(),
}))

// Mock react cache — pass-through (no real caching in tests)
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return { ...actual, cache: (fn: unknown) => fn }
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => { throw new Error('NOT_FOUND') }),
}))

// Mock next-intl
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => ({ has: () => false })),
}))

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}))

import { generateMetadata } from '@/app/track/[id]/page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('track page generateMetadata', () => {

  it('returns fallback title for invalid ULID', async () => {
    const result = await generateMetadata({ params: Promise.resolve({ id: 'not-a-ulid' }) })
    expect(result).toEqual({ title: 'Soultrack' })
    expect(mockGetTrack).not.toHaveBeenCalled()
  })

  it('returns fallback title for path traversal attempt', async () => {
    const result = await generateMetadata({ params: Promise.resolve({ id: '../../etc/passwd' }) })
    expect(result).toEqual({ title: 'Soultrack' })
    expect(mockGetTrack).not.toHaveBeenCalled()
  })

  it('returns fallback title when track not found', async () => {
    mockGetTrack.mockResolvedValue(null)
    const result = await generateMetadata({
      params: Promise.resolve({ id: '01HQJK5N7YVDPEM4GHSRX8Q2W3' }),
    })
    expect(result).toEqual({ title: 'Soultrack' })
  })

  it('returns fallback title when getTrack throws', async () => {
    mockGetTrack.mockRejectedValue(new Error('KV error'))
    const result = await generateMetadata({
      params: Promise.resolve({ id: '01HQJK5N7YVDPEM4GHSRX8Q2W3' }),
    })
    expect(result).toEqual({ title: 'Soultrack' })
  })

  it('generates metadata with track title and copy', async () => {
    mockGetTrack.mockResolvedValue({
      title: 'My Track',
      copy: 'A beautiful melody for calm.',
      emotion: 'calm',
    })
    const result = await generateMetadata({
      params: Promise.resolve({ id: '01HQJK5N7YVDPEM4GHSRX8Q2W3' }),
    })
    expect(result.title).toBe('My Track — Soultrack')
    expect(result.description).toBe('A beautiful melody for calm.')
    expect(result.openGraph?.title).toBe('My Track — Soultrack')
    expect(result.openGraph?.siteName).toBe('Soultrack')
    expect(result.twitter?.card).toBe('summary_large_image')
  })

  it('falls back to emotion description when copy is empty', async () => {
    mockGetTrack.mockResolvedValue({
      title: 'My Track',
      copy: '',
      emotion: 'joy',
    })
    const result = await generateMetadata({
      params: Promise.resolve({ id: '01HQJK5N7YVDPEM4GHSRX8Q2W3' }),
    })
    expect(result.description).toBe('An AI-generated melody for joy')
  })

  it('falls back to default description when copy and emotion are empty', async () => {
    mockGetTrack.mockResolvedValue({
      title: 'My Track',
      copy: '',
      emotion: '',
    })
    const result = await generateMetadata({
      params: Promise.resolve({ id: '01HQJK5N7YVDPEM4GHSRX8Q2W3' }),
    })
    expect(result.description).toBe('Discover the music of your moment on Soultrack.')
  })

  it('falls back to Soultrack title when track title is empty', async () => {
    mockGetTrack.mockResolvedValue({
      title: '',
      copy: 'Some copy',
      emotion: 'calm',
    })
    const result = await generateMetadata({
      params: Promise.resolve({ id: '01HQJK5N7YVDPEM4GHSRX8Q2W3' }),
    })
    expect(result.title).toBe('Soultrack')
  })
})

describe('ULID_REGEX validation', () => {
  it('accepts valid ULID format', async () => {
    mockGetTrack.mockResolvedValue({
      title: 'Valid', copy: 'c', emotion: 'calm',
    })
    const result = await generateMetadata({
      params: Promise.resolve({ id: '01HQJK5N7YVDPEM4GHSRX8Q2W3' }),
    })
    expect(result.title).toBe('Valid — Soultrack')
  })

  it('rejects lowercase ULID', async () => {
    const result = await generateMetadata({
      params: Promise.resolve({ id: '01hqjk5n7yvdpem4ghsrx8q2w3' }),
    })
    expect(result).toEqual({ title: 'Soultrack' })
    expect(mockGetTrack).not.toHaveBeenCalled()
  })

  it('rejects ULID with excluded characters (I, L, O, U)', async () => {
    const result = await generateMetadata({
      params: Promise.resolve({ id: '01IQJK5N7YVDPEM4GHSRX8Q2W3' }),
    })
    // 'I' is not in Crockford base32 — should fail
    expect(result).toEqual({ title: 'Soultrack' })
  })
})
