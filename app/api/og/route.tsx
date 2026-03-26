import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { getTrack } from '@/lib/kv'

export const runtime = 'edge'

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/
const HEX_RE = /^#[0-9A-Fa-f]{6}$/

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    let title = 'Soultrack'
    let emotionColor = '#00F5D4'
    let trackLoaded = !id // no id means homepage OG — always cacheable
    if (id && ULID_REGEX.test(id)) {
      try {
        const track = await getTrack(id)
        if (track?.title) {
          title = track.title
          trackLoaded = true
        }
        const ec = track?.emotionColor
        if (ec && HEX_RE.test(ec)) emotionColor = ec
      } catch {
        // KV unavailable — fall back to defaults, short cache
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
            background: '#0A0A0F',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Ambient emotion orb — color follows track's emotion */}
          <div
            style={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: emotionColor,
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
          {/* Brand icon — sibling above title, color matches emotion orb */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px',
              position: 'relative',
            }}
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path
                d="M 17 6 C 17 3, 8 3, 7 7 C 6 11, 16 13, 16 17 C 16 21, 7 21, 7 18"
                stroke={emotionColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
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
              color: emotionColor,
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
        headers: {
          'Cache-Control': trackLoaded
            ? 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
            : 'public, max-age=60, s-maxage=60',
        },
      },
    )
  } catch {
    // Fallback: return a simple branded OG image instead of 500
    try {
      return new ImageResponse(
        (
          <div
            style={{
              width: '1200px',
              height: '630px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0A0A0F',
              color: '#F0F0F8',
              fontSize: '48px',
              fontFamily: 'sans-serif',
            }}
          >
            Soultrack
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
        },
      )
    } catch {
      return new Response('OG image generation failed', { status: 500 })
    }
  }
}
