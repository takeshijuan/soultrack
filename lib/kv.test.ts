import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockKv = vi.hoisted(() => ({
  set: vi.fn(),
  get: vi.fn(),
  lpush: vi.fn(),
  lrange: vi.fn(),
  lrem: vi.fn(),
  incr: vi.fn(),
  zadd: vi.fn(),
  zrange: vi.fn(),
}))

vi.mock('@vercel/kv', () => ({ kv: mockKv }))
vi.mock('ulid', () => ({ ulid: () => 'test-ulid' }))

import {
  saveTrack,
  updateTrack,
  saveTrackToLibrary,
  getUserTrackIds,
  getUserTracks,
  isTrackInLibrary,
  addTrackToSitemap,
  getSitemapTrackIds,
} from './kv'
import type { TrackRecord } from './kv'

const baseRecord: TrackRecord = {
  predictionId: 'pred-1',
  title: 'Test Track',
  copy: 'Test copy',
  status: 'done',
  createdAt: Date.now() - 1000,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('saveTrack', () => {
  it('saves with TTL when no userId', async () => {
    await saveTrack('track-1', baseRecord)
    expect(mockKv.set).toHaveBeenCalledWith('track:track-1', baseRecord, { ex: 86400 })
  })

  it('saves without TTL when userId present', async () => {
    const record = { ...baseRecord, userId: 'user-1' }
    await saveTrack('track-1', record)
    expect(mockKv.set).toHaveBeenCalledWith('track:track-1', record)
    const callArgs = mockKv.set.mock.calls[0]
    expect(callArgs).toHaveLength(2)  // no 3rd arg (options)
  })
})

describe('updateTrack', () => {
  it('omits TTL when userId present', async () => {
    const existingRecord = { ...baseRecord, userId: 'user-1' }
    mockKv.get.mockResolvedValue(existingRecord)
    await updateTrack('track-1', { status: 'done' })
    const callArgs = mockKv.set.mock.calls[0]
    expect(callArgs[0]).toBe('track:track-1')
    expect(callArgs[1]).toMatchObject({ userId: 'user-1', status: 'done' })
    expect(callArgs[2]).toBeUndefined()
  })

  it('applies remainingTtl when userId absent', async () => {
    mockKv.get.mockResolvedValue(baseRecord)
    await updateTrack('track-1', { status: 'failed' })
    const callArgs = mockKv.set.mock.calls[0]
    expect(callArgs[2]).toMatchObject({ ex: expect.any(Number) })
    expect(callArgs[2].ex).toBeGreaterThan(0)
    expect(callArgs[2].ex).toBeLessThanOrEqual(86400)
  })

  it('returns early when track not found', async () => {
    mockKv.get.mockResolvedValue(null)
    await updateTrack('track-1', { status: 'done' })
    expect(mockKv.set).not.toHaveBeenCalled()
  })
})

describe('saveTrackToLibrary', () => {
  it('saves track and adds to user list', async () => {
    mockKv.lrange.mockResolvedValue([])
    mockKv.get.mockResolvedValue(baseRecord)
    await saveTrackToLibrary('user-1', 'track-1')
    expect(mockKv.set).toHaveBeenCalledWith('track:track-1', expect.objectContaining({ userId: 'user-1' }))
    expect(mockKv.lpush).toHaveBeenCalledWith('user:user-1:tracks', 'track-1')
  })

  it('skips duplicate without error', async () => {
    mockKv.lrange.mockResolvedValue(['track-1'])
    await saveTrackToLibrary('user-1', 'track-1')
    expect(mockKv.set).not.toHaveBeenCalled()
    expect(mockKv.lpush).not.toHaveBeenCalled()
  })

  it('returns early if track not found', async () => {
    mockKv.lrange.mockResolvedValue([])
    mockKv.get.mockResolvedValue(null)
    await saveTrackToLibrary('user-1', 'track-1')
    expect(mockKv.set).not.toHaveBeenCalled()
  })
})

describe('getUserTrackIds', () => {
  it('returns deduplicated ids', async () => {
    mockKv.lrange.mockResolvedValue(['track-1', 'track-2', 'track-1'])
    const ids = await getUserTrackIds('user-1')
    expect(ids).toEqual(['track-1', 'track-2'])
  })

  it('returns empty array for new user', async () => {
    mockKv.lrange.mockResolvedValue([])
    const ids = await getUserTrackIds('user-1')
    expect(ids).toEqual([])
  })
})

describe('getUserTracks', () => {
  it('returns empty array for new user', async () => {
    mockKv.lrange.mockResolvedValue([])
    const tracks = await getUserTracks('user-1')
    expect(tracks).toEqual([])
  })

  it('filters null tracks (expired)', async () => {
    mockKv.lrange.mockResolvedValue(['track-1', 'track-expired'])
    mockKv.get.mockImplementation((key: string) =>
      key === 'track:track-1' ? Promise.resolve(baseRecord) : Promise.resolve(null)
    )
    const tracks = await getUserTracks('user-1')
    expect(tracks).toHaveLength(1)
    expect(tracks[0].trackId).toBe('track-1')
  })
})

describe('isTrackInLibrary', () => {
  it('returns true when track in list', async () => {
    mockKv.lrange.mockResolvedValue(['track-1', 'track-2'])
    expect(await isTrackInLibrary('user-1', 'track-1')).toBe(true)
  })

  it('returns false when track not in list', async () => {
    mockKv.lrange.mockResolvedValue(['track-2'])
    expect(await isTrackInLibrary('user-1', 'track-1')).toBe(false)
  })
})

describe('addTrackToSitemap', () => {
  it('calls zadd with score=createdAt', async () => {
    await addTrackToSitemap('track-1', 1700000000)
    expect(mockKv.zadd).toHaveBeenCalledWith('sitemap:tracks', { score: 1700000000, member: 'track-1' })
  })

  it('swallows zadd errors (best-effort)', async () => {
    mockKv.zadd.mockRejectedValue(new Error('KV error'))
    await expect(addTrackToSitemap('track-1', 1700000000)).resolves.toBeUndefined()
  })
})

describe('getSitemapTrackIds', () => {
  it('returns track IDs from sorted set', async () => {
    mockKv.zrange.mockResolvedValue(['track-a', 'track-b'])
    const ids = await getSitemapTrackIds()
    expect(ids).toEqual(['track-a', 'track-b'])
    expect(mockKv.zrange).toHaveBeenCalledWith('sitemap:tracks', 0, -1)
  })

  it('returns empty array on error', async () => {
    mockKv.zrange.mockRejectedValue(new Error('KV error'))
    const ids = await getSitemapTrackIds()
    expect(ids).toEqual([])
  })
})

describe('updateTrack — sitemap hook', () => {
  it('adds to sitemap when status=done and userId present', async () => {
    mockKv.get.mockResolvedValue({ ...baseRecord, status: 'processing', userId: 'user-1' })
    await updateTrack('track-1', { status: 'done' })
    expect(mockKv.zadd).toHaveBeenCalledWith('sitemap:tracks', expect.objectContaining({ member: 'track-1' }))
  })

  it('does NOT add to sitemap when status=done but no userId', async () => {
    mockKv.get.mockResolvedValue({ ...baseRecord, status: 'processing' })
    await updateTrack('track-1', { status: 'done' })
    expect(mockKv.zadd).not.toHaveBeenCalled()
  })

  it('does NOT add to sitemap when status=failed with userId', async () => {
    mockKv.get.mockResolvedValue({ ...baseRecord, status: 'processing', userId: 'user-1' })
    await updateTrack('track-1', { status: 'failed' })
    expect(mockKv.zadd).not.toHaveBeenCalled()
  })
})

describe('saveTrackToLibrary — sitemap hook', () => {
  it('adds to sitemap when saving a done track without userId', async () => {
    mockKv.lrange.mockResolvedValue([])
    mockKv.get.mockResolvedValue({ ...baseRecord, status: 'done' })
    await saveTrackToLibrary('user-1', 'track-1')
    expect(mockKv.zadd).toHaveBeenCalledWith('sitemap:tracks', expect.objectContaining({ member: 'track-1' }))
  })

  it('does NOT add to sitemap when saving a processing track', async () => {
    mockKv.lrange.mockResolvedValue([])
    mockKv.get.mockResolvedValue({ ...baseRecord, status: 'processing' })
    await saveTrackToLibrary('user-1', 'track-1')
    expect(mockKv.zadd).not.toHaveBeenCalled()
  })
})
