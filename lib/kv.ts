import { kv } from '@vercel/kv'
import { ulid } from 'ulid'

export type TrackStatus = 'processing' | 'done' | 'failed' | 'timeout'

export interface TrackRecord {
  predictionId: string
  title: string
  copy: string
  status: TrackStatus
  audioUrl?: string
  createdAt: number
}

// Generate a ULID-based track ID
export function generateTrackId(): string {
  return ulid()
}

// Save a new track record (TTL 24 hours = 86400 seconds)
export async function saveTrack(
  trackId: string,
  record: TrackRecord,
): Promise<void> {
  await kv.set(`track:${trackId}`, record, { ex: 86400 })
}

// Get a track record; returns null if not found
export async function getTrack(trackId: string): Promise<TrackRecord | null> {
  return kv.get<TrackRecord>(`track:${trackId}`)
}

// Update partial fields of an existing track record
export async function updateTrack(
  trackId: string,
  updates: Partial<TrackRecord>,
): Promise<void> {
  const existing = await getTrack(trackId)
  if (existing === null) return
  const updated: TrackRecord = { ...existing, ...updates }
  await kv.set(`track:${trackId}`, updated, { ex: 86400 })
}

// Rate limiting: increment daily counter for IP, return current count
export async function getRateLimitCount(ip: string): Promise<number> {
  try {
    const dateStr = new Date().toISOString().split('T')[0]
    const key = `ratelimit:${ip}:${dateStr}`
    const count = await kv.incr(key)
    if (count === 1) {
      await kv.expire(key, 86400)
    }
    return count
  } catch {
    return Infinity
  }
}
