import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTrack } from '@/lib/kv'
import TrackPlayer from '@/components/TrackPlayer'

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return {
    title: 'Soultrack',
    openGraph: {
      images: [`/api/og?id=${id}`],
    },
  }
}

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let track
  try {
    track = await getTrack(id)
  } catch {
    notFound()
  }
  if (!track) notFound()

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
        <TrackPlayer
          trackId={id}
          initialStatus={track.status as 'processing' | 'done' | 'failed' | 'timeout'}
          initialAudioUrl={track.audioUrl}
          title={track.title}
          copy={track.copy}
          emotion={track.emotion}
        />
      </div>
    </main>
  )
}
