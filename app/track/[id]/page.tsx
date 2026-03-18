import { notFound } from 'next/navigation'
import { getTrack } from '@/lib/kv'
import TrackPlayer from '@/components/TrackPlayer'

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

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-4">
          <a href="/" className="text-gray-500 hover:text-gray-300 text-sm">← Soultrack</a>
        </div>
        <TrackPlayer
          trackId={id}
          initialStatus={track.status as 'processing' | 'done' | 'failed' | 'timeout'}
          initialAudioUrl={track.audioUrl}
          title={track.title}
          copy={track.copy}
        />
      </div>
    </main>
  )
}
