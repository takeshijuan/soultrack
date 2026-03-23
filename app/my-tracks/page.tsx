import { auth } from "@/auth"
import { getUserTracks } from "@/lib/kv"
import { redirect } from "next/navigation"
import Link from "next/link"
import DeleteTrackButton from "@/components/DeleteTrackButton"

export default async function MyTracksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const tracks = await getUserTracks(session.user.id)

  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">マイトラック</h1>
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
            + 新しいトラック
          </Link>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-muted)]">
            <p className="mb-4">まだトラックがありません</p>
            <Link href="/" className="text-white underline">最初のトラックを作る</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <div key={track.trackId} className="flex items-center gap-2">
                <Link
                  href={`/track/${track.trackId}`}
                  className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  style={{
                    borderLeftColor: track.emotionColor ?? undefined,
                    borderLeftWidth: track.emotionColor ? '3px' : undefined,
                    background: track.emotionColor ? `${track.emotionColor}08` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{track.title}</p>
                      <p className="text-[var(--text-muted)] text-xs mt-1">{track.emotion}</p>
                    </div>
                    {track.emotionColor && (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: track.emotionColor }}
                      />
                    )}
                  </div>
                </Link>
                {/* DeleteTrackButton は Client Component — optimistic UI + Undoトースト */}
                <DeleteTrackButton trackId={track.trackId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
