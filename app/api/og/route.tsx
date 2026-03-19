import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { getTrack } from '@/lib/kv'

export const runtime = 'edge'

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  let title = 'Soultrack'
  if (id && ULID_REGEX.test(id)) {
    const track = await getTrack(id)
    if (track?.title) title = track.title
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
          background: '#0A0A0F',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Ambient teal orb */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: '#00F5D4',
            opacity: 0.08,
            filter: 'blur(80px)',
          }}
        />
        {/* Ambient amber orb */}
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: '#FF9A3C',
            opacity: 0.06,
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: '#F0F0F8',
            textAlign: 'center',
            padding: '0 80px',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
            position: 'relative',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#00F5D4',
            textAlign: 'center',
            letterSpacing: '0.05em',
            position: 'relative',
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
