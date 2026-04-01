import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import { getTrack, updateTrack } from '@/lib/kv'
import { ReplicateProvider } from '@/lib/music/providers/replicate'

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/
const LYRIA_TIMEOUT_MS = 180_000 // 3 minutes

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
    return Response.json({
      status: track.status,
      audioUrl: track.audioUrl,
      requestedDuration: track.requestedDuration,
    })
  }

  // 3. Lyria tracks: return KV state only (no polling needed)
  //    Also handles existing tracks without predictionId
  if (track.provider === 'lyria' || !track.predictionId) {
    // Check for timeout (processing too long)
    const elapsed = Date.now() - track.createdAt
    if (elapsed > LYRIA_TIMEOUT_MS) {
      await updateTrack(trackId, { status: 'timeout' })
      return Response.json({ status: 'timeout' })
    }
    return Response.json({ status: 'processing' })
  }

  // 4. Replicate tracks: poll music provider for current status
  try {
    const replicate = new ReplicateProvider()
    const result = await replicate.getStatus(track.predictionId!)

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
      }

      await updateTrack(trackId, { status: 'done', audioUrl: permanentUrl })
      return Response.json({
        status: 'done',
        audioUrl: permanentUrl,
        requestedDuration: track.requestedDuration,
      })
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
