import { auth } from "@/auth"
import { getUserTracks } from "@/lib/kv"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from 'next-intl/server'
import TrackList from "@/components/TrackList"
import EmptyLibrary from "@/components/EmptyLibrary"

export default async function MyTracksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const [tracks, t, tEmotions] = await Promise.all([
    getUserTracks(session.user.id),
    getTranslations('library'),
    getTranslations('emotions'),
  ])

  const serializedTracks = tracks.map(track => ({
    trackId: track.trackId,
    title: track.title,
    emotion: track.emotion,
    emotionLabel: track.emotion && tEmotions.has(track.emotion)
      ? tEmotions(track.emotion)
      : track.emotion,
    emotionColor: track.emotionColor,
    createdAt: track.createdAt,
  }))

  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)]">
      <div className="ambient-content max-w-2xl mx-auto px-5 py-12">
        {/* Back nav (track pageと統一) */}
        <div className="mb-10">
          <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors">
            ← Soultrack
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-[var(--text-muted)] uppercase mb-3 font-medium">
              {t('eyebrow')}
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] leading-tight">
              {t('heading')}
            </h1>
            {tracks.length > 0 && (
              <p className="text-[var(--text-muted)] text-sm mt-2">
                {t('trackCount', { count: tracks.length })}
              </p>
            )}
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm
                       bg-[var(--accent-teal)] text-black flex-shrink-0
                       transition-all duration-300
                       hover:bg-white hover:shadow-[0_0_40px_rgba(0,245,212,0.4)]"
          >
            {t('newTrack')}
          </Link>
        </div>

        {/* Content */}
        {tracks.length === 0 ? (
          <EmptyLibrary />
        ) : (
          <TrackList tracks={serializedTracks} />
        )}
      </div>
    </main>
  )
}
