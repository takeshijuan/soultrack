import { NextRequest } from 'next/server'
import { kv } from '@vercel/kv'
import { auth } from '@/auth'
import { getTrack, saveTrackToLibrary, isTrackInLibrary } from '@/lib/kv'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { trackId } = await params
  const track = await getTrack(trackId)
  if (!track) {
    return Response.json({ error: 'Track not found' }, { status: 404 })
  }

  const alreadySaved = await isTrackInLibrary(session.user.id, trackId)
  if (alreadySaved) {
    return Response.json({ saved: true, alreadySaved: true })
  }

  await saveTrackToLibrary(session.user.id, trackId)
  console.log(`[save-track] saved trackId=${trackId} for userId=${session.user.id}`)
  return Response.json({ saved: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { trackId } = await params
  try {
    await kv.lrem(`user:${session.user.id}:tracks`, 0, trackId)
    console.log(`[save-track] removed trackId=${trackId} from userId=${session.user.id}`)
    return Response.json({ deleted: true })
  } catch (err) {
    console.error('[save-track] DELETE kv.lrem failed:', err)
    return Response.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
