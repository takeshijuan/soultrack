import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTrack, isTrackInLibrary } from '@/lib/kv'
import TrackPlayer from '@/components/TrackPlayer'
import SaveToLibraryButton from '@/components/SaveToLibraryButton'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: 'Soultrack',
    openGraph: {
      url: `/track/${id}`,
      images: [`/api/og?id=${id}`],
    },
    twitter: {
      images: [`/api/og?id=${id}`],
    },
  }
}

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

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

  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)]">
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
