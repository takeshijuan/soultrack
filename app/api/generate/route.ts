import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { createGateway } from '@ai-sdk/gateway'
import { getRateLimitCount, saveTrack, generateTrackId } from '@/lib/kv'
import { getMusicProvider } from '@/lib/music'
import { buildClaudePrompt, parseClaudeResponse } from '@/lib/prompts'
import { Q1_SET, Q2_SET, Q3_SET } from '@/lib/pool'
import { EMOTION_COLORS } from '@/lib/emotions'

const gateway = createGateway()

const BYPASS_IPS = (process.env.RATE_LIMIT_BYPASS_IPS ?? '')
  .split(',').map(s => s.trim()).filter(Boolean)

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: { q1?: string; q2?: string; q3?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { q1, q2, q3 } = body

  // 2. Allowlist validation (also rejects missing/undefined fields)
  if (!q1 || !q2 || !q3 || !Q1_SET.has(q1) || !Q2_SET.has(q2) || !Q3_SET.has(q3)) {
    return Response.json({ error: 'Invalid selection' }, { status: 400 })
  }

  // 3. Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  // Skip rate limiting when IP cannot be determined (e.g., local dev)
  if (ip !== 'unknown' && !BYPASS_IPS.includes(ip)) {
    const count = await getRateLimitCount(ip)
    if (count > 3) {
      return Response.json({ error: 'Daily limit reached' }, { status: 429 })
    }
  }

  // 4. Claude: get musicPrompt, title, copy
  const { system, user } = buildClaudePrompt(q1, q2, q3)

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
        // Retry once
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

  // 5. Music generation
  let predictionId: string
  try {
    predictionId = await getMusicProvider().startGeneration({
      description: musicPrompt,
      durationSeconds: 20,
    })
  } catch {
    return Response.json({ error: "Couldn't start generation" }, { status: 500 })
  }

  // 6. Save to KV
  const trackId = generateTrackId()
  const emotionColor = EMOTION_COLORS[q2] ?? '#00F5D4'
  try {
    await saveTrack(trackId, {
      predictionId,
      title,
      copy,
      status: 'processing',
      createdAt: Date.now(),
      emotion: q2,
      emotionColor,
    })
  } catch {
    return Response.json({ error: 'Failed to save track' }, { status: 500 })
  }

  // 7. Return trackId
  return Response.json({ trackId }, { status: 200 })
}
