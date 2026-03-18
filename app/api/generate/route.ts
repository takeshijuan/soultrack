import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { getRateLimitCount, saveTrack, generateTrackId } from '@/lib/kv'
import { getMusicProvider } from '@/lib/music'
import { buildClaudePrompt, parseClaudeResponse } from '@/lib/prompts'
import { Q1_SET, Q2_SET, Q3_SET } from '@/lib/pool'

export async function POST(request: NextRequest) {
  // 1. Parse body
  const body = await request.json()
  const { q1, q2, q3 } = body as { q1: string; q2: string; q3: string }

  // 2. Allowlist validation
  if (!Q1_SET.has(q1) || !Q2_SET.has(q2) || !Q3_SET.has(q3)) {
    return Response.json({ error: 'Invalid selection' }, { status: 400 })
  }

  // 3. Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const count = await getRateLimitCount(ip)
  if (count > 3) {
    return Response.json({ error: 'Daily limit reached' }, { status: 429 })
  }

  // 4. Claude: get musicPrompt, title, copy
  const { system, user } = buildClaudePrompt(q1, q2, q3)

  let musicPrompt: string
  let title: string
  let copy: string

  const callClaude = async () => {
    const result = await generateText({
      model: anthropic('claude-sonnet-4-5'),
      system,
      prompt: user,
    })
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
  } catch {
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
  try {
    await saveTrack(trackId, {
      predictionId,
      title,
      copy,
      status: 'processing',
      createdAt: Date.now(),
    })
  } catch {
    return Response.json({ error: 'Failed to save track' }, { status: 500 })
  }

  // 7. Return trackId
  return Response.json({ trackId }, { status: 200 })
}
