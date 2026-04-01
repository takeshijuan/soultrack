import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cache } from 'react'
import { getTrack as _getTrack, isTrackInLibrary } from '@/lib/kv'
import TrackPlayer from '@/components/TrackPlayer'
import SaveToLibraryButton from '@/components/SaveToLibraryButton'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'

// Per-request memoization — prevents double KV fetch between generateMetadata and page render
const getTrack = cache(_getTrack)

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

// /api/og/route.tsx と同じ正規表現で統一
const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // /api/og と同様に ULID 検証。不正な id を KV に渡さない
  if (!ULID_REGEX.test(id)) return { title: 'Soultrack' }
  const track = await getTrack(id).catch(() => null)

  if (!track) {
    return { title: 'Soultrack' }
  }

  const title = track.title ? `${track.title} — Soultrack` : 'Soultrack'
  const description =
    track.copy ||
    (track.emotion ? `An AI-generated melody for ${track.emotion}` : 'Discover the music of your moment on Soultrack.')

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Soultrack',
      url: `/track/${id}`,
      type: 'website',
      images: [{
        url: `/api/og?id=${id}`,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [{
        url: `/api/og?id=${id}`,
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
  }
}

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!ULID_REGEX.test(id)) notFound()

  // auth() と getTrack() を並列化（R6）
  const [session, track] = await Promise.all([
    auth(),
    getTrack(id).catch(() => null),
  ])
  const userId = session?.user?.id
  const t = await getTranslations('emotions')
  if (!track) notFound()

  const alreadySaved = userId ? await isTrackInLibrary(userId, id) : false

  // XSS prevention: validate emotionColor before injecting into <style>
  const safeEmotionColor = HEX_RE.test(track.emotionColor ?? '')
    ? track.emotionColor
    : '#00F5D4'

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://soultrack.io')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: track.title || 'Soultrack',
    description:
      track.copy ||
      (track.emotion ? `An AI-generated melody for ${track.emotion}` : undefined),
    url: `${siteUrl}/track/${id}`,
    // contentUrl は意図的に除外:
    //   - audioUrl は Replicate の署名付きURL (有効期限あり)
    //   - 検索エンジンがクロールするタイミングで無効になる可能性がある
    //   - 公開露出によるセキュリティリスクを避けるため省略
    creator: {
      '@type': 'Organization',
      name: 'Soultrack',
      url: siteUrl,
    },
  }

  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)]">
      {/* JSON-LD: Next.js App RouterではgenerateメタデータAPI以外でheadへの注入が困難なため
          body内に配置。GoogleはJSON-LDがbody内にあってもサポートしている。
          JSON.stringify後に <> をUnicodeエスケープしてスクリプトインジェクションを防止。 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026'),
        }}
      />
      {/* Inject emotion color as CSS variable (SSR — correct color before JS) */}
      {safeEmotionColor && (
        <style>{`:root { --emotion-hue: ${safeEmotionColor}; }`}</style>
      )}
      <div className="ambient-content max-w-2xl mx-auto px-4 py-12">
        <div className="mb-10">
          <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors">
            ← Soultrack
          </Link>
        </div>
        {track.emotion && (
          <div className="mb-6 flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: `${safeEmotionColor}18`,
                border: `1px solid ${safeEmotionColor}`,
                color: safeEmotionColor,
              }}
            >
              {track.emotion && t.has(track.emotion) ? t(track.emotion) : track.emotion}
            </span>
          </div>
        )}
        <TrackPlayer
          trackId={id}
          initialStatus={track.status as 'processing' | 'done' | 'failed' | 'timeout'}
          initialAudioUrl={track.audioUrl}
          title={track.title}
          copy={track.copy}
          emotion={track.emotion}
          trackSize={track.trackSize}
        />
        <div className="mt-6 flex justify-center">
          <SaveToLibraryButton
            trackId={id}
            isAuthenticated={!!userId}
            initialSaved={alreadySaved}
          />
        </div>
      </div>
    </main>
  )
}
