import { NextRequest, NextResponse, after } from 'next/server'
import { generateText } from 'ai'
import { createGateway } from '@ai-sdk/gateway'
import { kv } from '@vercel/kv'
import { put } from '@vercel/blob'
import { getRateLimitCount, saveTrack, updateTrack, generateTrackId } from '@/lib/kv'
import { getMusicProvider } from '@/lib/music'
import { ReplicateProvider } from '@/lib/music/providers/replicate'
import { buildClaudePrompt, parseClaudeResponse } from '@/lib/prompts'
import { EMOTION_COLORS } from '@/lib/emotions'
import { resolveLocale } from '@/lib/locale'
import { auth } from '@/auth'
import enMessages from '@/messages/en.json'
import jaMessages from '@/messages/ja.json'
import koMessages from '@/messages/ko.json'
import zhMessages from '@/messages/zh.json'
import zhTWMessages from '@/messages/zh-TW.json'

export const runtime = 'nodejs'
export const maxDuration = 120

const gateway = createGateway()

const BYPASS_IPS = (process.env.RATE_LIMIT_BYPASS_IPS ?? '')
  .split(',').map(s => s.trim()).filter(Boolean)

const VALID_DURATIONS = new Set([30, 120])

// Q2 uses English slugs (locale-independent enum)
const Q2_SLUGS = new Set(Object.keys(EMOTION_COLORS))
// Q1/Q3 accept any value from any locale's pool
const Q1_ALL = new Set([
  ...enMessages.pool.q1, ...jaMessages.pool.q1,
  ...koMessages.pool.q1, ...zhMessages.pool.q1, ...zhTWMessages.pool.q1,
])
const Q3_ALL = new Set([
  ...enMessages.pool.q3, ...jaMessages.pool.q3,
  ...koMessages.pool.q3, ...zhMessages.pool.q3, ...zhTWMessages.pool.q3,
])

export async function POST(request: NextRequest) {
  // 0. 認証状態確認（認証済みはレート制限スキップ + 自動ライブラリ保存）
  const session = await auth()
  const userId = session?.user?.id ?? undefined

  // 1. Parse body
  let body: { q1?: string; q2?: string; q3?: string; duration?: number }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { q1, q2, q3 } = body

  // 2. Allowlist validation (also rejects missing/undefined fields)
  if (!q1 || !q2 || !q3 || !Q1_ALL.has(q1) || !Q2_SLUGS.has(q2) || !Q3_ALL.has(q3)) {
    return Response.json({ error: 'Invalid selection' }, { status: 400 })
  }

  // 3. Duration validation (allowlist, default to 120)
  const duration = typeof body.duration === 'number' && VALID_DURATIONS.has(body.duration) ? body.duration : 120

  // 4. Rate limiting（認証済みはスキップ）
  let rateLimitCount = 0
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!userId && ip !== 'unknown' && !BYPASS_IPS.includes(ip)) {
    rateLimitCount = await getRateLimitCount(ip)
    if (rateLimitCount > 3) {
      return Response.json({ error: 'Daily limit reached' }, { status: 429 })
    }
  }

  // 5. Resolve locale
  const locale = resolveLocale(
    request.cookies.get('NEXT_LOCALE')?.value,
    request.headers.get('accept-language') ?? undefined,
  )

  // 6. Claude: get musicPrompt, title, copy
  const { system, user } = buildClaudePrompt(q1, q2, q3, locale)

  let musicPrompt: string
  let title: string
  let copy: string

  const callClaude = async () => {
    const result = await generateText({
      model: gateway('anthropic/claude-sonnet-4-5'),
      system,
      prompt: user,
    })
    console.log('[generate] Claude raw response:', JSON.stringify(result.text))
    return parseClaudeResponse(result.text)
  }

  try {
    try {
      const parsed = await callClaude()
      musicPrompt = parsed.musicPrompt
      title = parsed.title
      copy = parsed.copy
    } catch (err) {
      if (err instanceof Error && err.message === 'PARSE_FAILED') {
        const parsed = await callClaude()
        musicPrompt = parsed.musicPrompt
        title = parsed.title
        copy = parsed.copy
      } else {
        throw err
      }
    }
  } catch (err) {
    console.error('[generate] Claude error:', err)
    return Response.json({ error: 'Failed to generate track metadata' }, { status: 500 })
  }

  // 7. Add structure hints for Lyria Pro
  const fullPrompt = duration > 30
    ? `${musicPrompt}\nSong structure: [Intro] [Verse 1] [Chorus] [Verse 2] [Chorus] [Outro]`
    : musicPrompt

  // 8. Save initial record to KV + return trackId immediately
  const trackId = generateTrackId()
  const emotionColor = EMOTION_COLORS[q2] ?? '#00F5D4'
  const provider = getMusicProvider(duration)
  const rawProvider = process.env.MUSIC_PROVIDER ?? 'replicate'
  const providerFamily: 'replicate' | 'lyria' = rawProvider === 'lyria' ? 'lyria' : 'replicate'

  try {
    await saveTrack(trackId, {
      title,
      copy,
      status: 'processing',
      createdAt: Date.now(),
      emotion: q2,
      emotionColor,
      userId,
      provider: providerFamily,
      requestedDuration: duration,
    })
    if (userId) {
      await kv.lpush(`user:${userId}:tracks`, trackId)
    }
  } catch (err) {
    console.error('[generate] KV save error:', err)
    return Response.json({ error: 'Failed to save track' }, { status: 500 })
  }

  const remainingToday = (userId || ip === 'unknown') ? null : Math.max(0, 3 - rateLimitCount)
  const response = NextResponse.json({ trackId, remainingToday }, { status: 200 })

  // 9. Background: generate music + upload to Blob
  if (provider.generateSync) {
    after(async () => {
      const startTime = Date.now()
      try {
        console.log(`[generate] Lyria ${duration > 30 ? 'Pro' : 'Clip'} starting: trackId=${trackId}`)
        const result = await provider.generateSync!({
          description: fullPrompt,
          durationSeconds: duration,
        })
        console.log(`[generate] Lyria completed: trackId=${trackId}, latency=${Date.now() - startTime}ms`)

        // Upload to Vercel Blob
        let audioUrl: string
        try {
          const blob = await put(`tracks/${trackId}.mp3`, result.audioData, {
            contentType: result.mimeType,
            access: 'public',
          })
          audioUrl = blob.url
        } catch (blobErr) {
          console.error(`[generate] Blob upload failed, retrying: trackId=${trackId}`, blobErr)
          try {
            const blob = await put(`tracks/${trackId}.mp3`, result.audioData, {
              contentType: result.mimeType,
              access: 'public',
            })
            audioUrl = blob.url
          } catch (retryErr) {
            console.error(`[generate] Blob upload retry also failed: trackId=${trackId}`, retryErr)
            await updateTrack(trackId, { status: 'failed' })
            return
          }
        }

        await updateTrack(trackId, { status: 'done', audioUrl })
        console.log(`[generate] Track done: trackId=${trackId}, url=${audioUrl}`)
      } catch (err) {
        console.error(`[generate] Lyria failed, falling back to Replicate: trackId=${trackId}`, err)

        // Check for safety filter rejection
        const errMsg = err instanceof Error ? err.message : String(err)
        if (errMsg.includes('SAFETY') || errMsg.includes('blocked') || errMsg.includes('filter')) {
          await updateTrack(trackId, { status: 'failed' })
          console.error(`[generate] Safety filter rejection: trackId=${trackId}`)
          return
        }

        // Fallback to Replicate
        try {
          const replicate = new ReplicateProvider()
          const predictionId = await replicate.startGeneration({
            description: musicPrompt,
            durationSeconds: 20,
          })
          await updateTrack(trackId, {
            predictionId,
            status: 'processing',
            provider: 'replicate',
          })
          console.log(`[generate] Replicate fallback started: trackId=${trackId}, predictionId=${predictionId}`)
        } catch (fallbackErr) {
          console.error(`[generate] Replicate fallback also failed: trackId=${trackId}`, fallbackErr)
          await updateTrack(trackId, { status: 'failed' })
        }
      }
    })
  } else {
    // Async polling path (Replicate)
    try {
      const predictionId = await provider.startGeneration({
        description: fullPrompt,
        durationSeconds: duration,
      })
      await updateTrack(trackId, { predictionId })
    } catch (err) {
      console.error('[generate] Music generation error:', err instanceof Error ? err.message : String(err))
      await updateTrack(trackId, { status: 'failed' })
    }
  }

  return response
}
