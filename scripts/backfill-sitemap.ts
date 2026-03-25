/**
 * 既存永続トラックのサイトマップバックフィル
 *
 * 実行: KV_REST_API_URL=... KV_REST_API_TOKEN=... npx tsx scripts/backfill-sitemap.ts
 *
 * zadd は冪等なので何度実行しても安全
 * userId 付き + status=done のトラックのみ追加
 */
import { createClient } from '@vercel/kv'

const SITEMAP_TRACKS_KEY = 'sitemap:tracks'

async function main() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    console.error('KV_REST_API_URL and KV_REST_API_TOKEN are required')
    process.exit(1)
  }

  const kv = createClient({ url, token })

  let added = 0
  let scanned = 0
  let skipped = 0

  for await (const key of kv.scanIterator({ match: 'track:*', count: 100 })) {
    scanned++
    const trackId = (key as string).replace('track:', '')

    const track = await kv.get<{
      userId?: string
      createdAt: number
      status: string
    }>(key as string)

    if (!track || !track.userId || track.status !== 'done') {
      skipped++
      continue
    }

    try {
      await kv.zadd(SITEMAP_TRACKS_KEY, { score: track.createdAt, member: trackId })
      added++
    } catch (err) {
      console.error(`  [error] ${trackId}:`, err)
      continue
    }

    if (added % 50 === 0) console.log(`  ... ${added} tracks indexed`)
  }

  const total = await kv.zcard(SITEMAP_TRACKS_KEY)
  console.log(
    `Done: scanned=${scanned} added=${added} skipped=${skipped} total=${total}`,
  )
}

main().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
