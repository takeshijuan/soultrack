import { kv } from '@vercel/kv'
import { ulid } from 'ulid'

const KV_TTL_24H = 86400
const SITEMAP_TRACKS_KEY = 'sitemap:tracks'

export type TrackStatus = 'processing' | 'done' | 'failed' | 'timeout'

export interface TrackRecord {
  predictionId?: string
  title: string
  copy: string
  status: TrackStatus
  audioUrl?: string
  createdAt: number
  emotion?: string
  emotionColor?: string
  userId?: string
  provider?: 'replicate' | 'lyria'
  trackSize?: 'short' | 'long'
}

// Generate a ULID-based track ID
export function generateTrackId(): string {
  return ulid()
}

// Save a new track record
// userId あり → 永続保存（TTLなし）
// userId なし → TTL 24時間
export async function saveTrack(
  trackId: string,
  record: TrackRecord,
): Promise<void> {
  if (record.userId) {
    await kv.set(`track:${trackId}`, record)
  } else {
    await kv.set(`track:${trackId}`, record, { ex: KV_TTL_24H })
  }
}

// Get a track record; returns null if not found
export async function getTrack(trackId: string): Promise<TrackRecord | null> {
  return kv.get<TrackRecord>(`track:${trackId}`)
}

// Update partial fields of an existing track record
// userId 付きトラックは永続保存を維持する（TTL再付与しない）
export async function updateTrack(
  trackId: string,
  updates: Partial<TrackRecord>,
): Promise<void> {
  const existing = await getTrack(trackId)
  if (existing === null) return
  const updated: TrackRecord = { ...existing, ...updates }
  if (updated.userId) {
    await kv.set(`track:${trackId}`, updated)  // 永続（TTLなし）
  } else {
    const remainingTtl = Math.min(KV_TTL_24H, Math.max(1, KV_TTL_24H - Math.floor((Date.now() - existing.createdAt) / 1000)))
    await kv.set(`track:${trackId}`, updated, { ex: remainingTtl })
  }

  // status=done かつ userId 付きの場合のみサイトマップに追加
  // （processing/failed/timeout のトラックをインデックスしない）
  if (updated.status === 'done' && updated.userId) {
    await addTrackToSitemap(trackId, updated.createdAt)
  }
}

// トラックをユーザーライブラリに保存
// - kv.persist() は @vercel/kv に存在しないため kv.set で TTLなし上書き
// - TrackRecord.userId を更新して永続化
// - 重複保存を防ぐため既存チェックあり
export async function saveTrackToLibrary(userId: string, trackId: string): Promise<void> {
  const alreadySaved = await isTrackInLibrary(userId, trackId)
  if (alreadySaved) return

  const track = await getTrack(trackId)
  if (!track) return

  // 既存 userId がある場合は上書きしない（他ユーザーの所有権を保護）
  // 複数ユーザーが同じトラックをライブラリに追加できるが、ownership は最初のユーザーに帰属
  if (!track.userId) {
    await kv.set(`track:${trackId}`, { ...track, userId })
    if (track.status === 'done') {
      await addTrackToSitemap(trackId, track.createdAt)
    }
  }
  try {
    await kv.lpush(`user:${userId}:tracks`, trackId)
  } catch (err) {
    console.error('[saveTrackToLibrary] lpush failed, track saved but not indexed:', err)
    // 部分的な失敗: trackレコードはuserId付きで永続化されているがリストには入っていない
    // TODO: 定期的な整合性チェックでリカバリー
  }
}

// ユーザーのライブラリにある trackId リスト取得（新しい順）
// 上限50件。重複エントリ（TOCTOU競合時）を排除
// TODO: スケール時は kv.lpos か Set型 (isTrackInLibrary O(1)化) を検討
export async function getUserTrackIds(userId: string): Promise<string[]> {
  const raw = (await kv.lrange(`user:${userId}:tracks`, 0, 49)) as string[]
  return [...new Set(raw)]
}

// ユーザーのトラック一覧取得（trackId も返す — /my-tracks のリンクに必要）
// TODO: スケール時は kv.mget でバッチ化してN+1解消
export async function getUserTracks(
  userId: string,
): Promise<(TrackRecord & { trackId: string })[]> {
  const ids = await getUserTrackIds(userId)
  const records = await Promise.all(
    ids.map(async (id) => {
      const record = await getTrack(id)
      return record ? { ...record, trackId: id } : null
    }),
  )
  return records.filter((t): t is TrackRecord & { trackId: string } => t !== null)
}

// トラックがユーザーのライブラリにあるか確認
// TODO: スケール時は kv.lpos でO(1)化を検討
export async function isTrackInLibrary(userId: string, trackId: string): Promise<boolean> {
  const ids = await getUserTrackIds(userId)
  return ids.includes(trackId)
}

// Rate limiting: increment daily counter for IP, return current count
export async function getRateLimitCount(ip: string): Promise<number> {
  try {
    const dateStr = new Date().toISOString().split('T')[0]
    const key = `ratelimit:${ip}:${dateStr}`
    await kv.set(key, 0, { ex: KV_TTL_24H, nx: true })
    const count = await kv.incr(key)
    return count
  } catch {
    return Infinity
  }
}

// ── Sitemap index ────────────────────────────────────────────

/** サイトマップ sorted set にトラックを追加（冪等・best-effort） */
export async function addTrackToSitemap(
  trackId: string,
  createdAt: number,
): Promise<void> {
  try {
    await kv.zadd(SITEMAP_TRACKS_KEY, { score: createdAt, member: trackId })
  } catch (err) {
    console.error('[sitemap] zadd failed:', err)
  }
}

/** サイトマップ用の全トラック ID を取得（createdAt 昇順） */
export async function getSitemapTrackIds(): Promise<string[]> {
  try {
    return await kv.zrange<string[]>(SITEMAP_TRACKS_KEY, 0, -1)
  } catch (err) {
    console.error('[sitemap] zrange failed:', err)
    return []
  }
}
