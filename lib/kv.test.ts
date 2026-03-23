import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockKv = vi.hoisted(() => ({
  set: vi.fn(),
  get: vi.fn(),
  lpush: vi.fn(),
  lrange: vi.fn(),
  lrem: vi.fn(),
  incr: vi.fn(),
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
