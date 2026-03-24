import { NextRequest } from 'next/server'
import { addToWaitlist } from '@/lib/kv'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return Response.json({ error: 'email required' }, { status: 400 })
  }

  const { email } = body as { email?: unknown }
  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'email required' }, { status: 400 })
  }
  const normalized = email.trim().toLowerCase()
  if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
    return Response.json({ error: 'invalid email' }, { status: 400 })
  }

  try {
    await addToWaitlist(normalized)
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[waitlist] failed to save email:', e)
    return Response.json({ error: 'failed' }, { status: 500 })
  }
}
