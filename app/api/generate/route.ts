import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { createGateway } from '@ai-sdk/gateway'
import { kv } from '@vercel/kv'
import { getRateLimitCount, saveTrack, generateTrackId } from '@/lib/kv'
import { getMusicProvider } from '@/lib/music'
import { buildClaudePrompt, parseClaudeResponse } from '@/lib/prompts'
import { EMOTION_COLORS } from '@/lib/emotions'
import { auth } from '@/auth'
import enMessages from '@/messages/en.json'
import jaMessages from '@/messages/ja.json'
import koMessages from '@/messages/ko.json'
import zhMessages from '@/messages/zh.json'
import zhTWMessages from '@/messages/zh-TW.json'

const gateway = createGateway()

const BYPASS_IPS = (process.env.RATE_LIMIT_BYPASS_IPS ?? '')
  .split(',').map(s => s.trim()).filter(Boolean)

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
  let body: { q1?: string; q2?: string; q3?: string }
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

  // 3. Rate limiting（認証済みはスキップ）
  // 既知の制限: 同一IP（NAT/オフィス）で複数ユーザーが制限を共有する。認証済みはスキップ。
  let rateLimitCount = 0
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!userId && ip !== 'unknown' && !BYPASS_IPS.includes(ip)) {
    rateLimitCount = await getRateLimitCount(ip)
    if (rateLimitCount > 3) {
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
  } catch (err) {
    console.error('[generate] Music generation error:', err instanceof Error ? err.message : String(err))
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
      userId,  // あれば永続保存・なければTTL 24h
    })
    if (userId) {
      // 新規生成トラックは重複なし確定 → isTrackInLibrary チェック不要
      // saveTrackToLibrary は lpush + set(上書き)するが、set は saveTrack済みのため不要
      await kv.lpush(`user:${userId}:tracks`, trackId)
    }
  } catch (err) {
    console.error('[generate] KV save error:', err)
    return Response.json({ error: 'Failed to save track' }, { status: 500 })
  }

  // 7. Return trackId + remainingToday
  // 未認証 かつ IP が判明している場合のみ残り回数を返す
  // - userId あり → null（無制限）
  // - ip='unknown' → null（IP不明のためカウント不正確、情報を出さない）
  // - rateLimitCount を再利用してカウンターの二重インクリメントを防ぐ
  const remainingToday = (userId || ip === 'unknown') ? null : Math.max(0, 3 - rateLimitCount)
  return Response.json({ trackId, remainingToday }, { status: 200 })
}
