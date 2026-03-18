import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { getTrack } from '@/lib/kv'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  let title = 'Soultrack'
  if (id) {
    try {
      const track = await getTrack(id)
      if (track?.title) {
        title = track.title
      }
    } catch {
      // fall back to default title
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            padding: '0 80px',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#9ca3af',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          the music of your moment
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
