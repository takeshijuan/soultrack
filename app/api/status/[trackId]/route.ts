import { NextRequest } from 'next/server'
import { getTrack, updateTrack } from '@/lib/kv'
import { getMusicProvider } from '@/lib/music'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const { trackId } = await params

  // 1. Get track from KV
  const track = await getTrack(trackId)
  if (track === null) {
    return Response.json({ error: 'Track not found' }, { status: 404 })
  }

  // 2. If already in a terminal state, return immediately
  if (
    track.status === 'done' ||
    track.status === 'failed' ||
    track.status === 'timeout'
  ) {
    return Response.json({ status: track.status, audioUrl: track.audioUrl })
  }

  // 3. Poll music provider for current status
  try {
    const result = await getMusicProvider().getStatus(track.predictionId)

    if (result.status === 'succeeded') {
      await updateTrack(trackId, { status: 'done', audioUrl: result.audioUrl })
      return Response.json({ status: 'done', audioUrl: result.audioUrl })
    }

    if (result.status === 'failed') {
      await updateTrack(trackId, { status: 'failed' })
      return Response.json({ status: 'failed' })
    }

    // still processing
    return Response.json({ status: 'processing' })
  } catch (err) {
    console.error('[status] getStatus error:', err)
    return Response.json({ status: 'processing' })
  }
}
