import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import { getTrack, updateTrack } from '@/lib/kv'
import { getMusicProvider } from '@/lib/music'

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const { trackId } = await params
  if (!ULID_REGEX.test(trackId)) {
    return Response.json({ error: 'Track not found' }, { status: 404 })
  }

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
      // Persist audio to Vercel Blob for long-term availability
      let permanentUrl = result.audioUrl
      try {
        const response = await fetch(result.audioUrl)
        const audioBuffer = await response.arrayBuffer()
        const blob = await put(`tracks/${trackId}.wav`, audioBuffer, {
          access: 'public',
          contentType: 'audio/wav',
        })
        permanentUrl = blob.url
        console.log(`[status] blob upload success: trackId=${trackId}, url=${permanentUrl}, size=${audioBuffer.byteLength}`)
      } catch (blobErr) {
        console.error(`[status] blob upload failed, falling back to temp URL: trackId=${trackId}, error=${blobErr}`)
        // Graceful degradation: use temp URL
      }

      await updateTrack(trackId, { status: 'done', audioUrl: permanentUrl })
      return Response.json({ status: 'done', audioUrl: permanentUrl })
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
