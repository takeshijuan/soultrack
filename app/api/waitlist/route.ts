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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return Response.json({ error: 'invalid email' }, { status: 400 })
  }

  try {
    await addToWaitlist(email.toLowerCase().trim())
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[waitlist] failed to save email:', e)
    return Response.json({ error: 'failed' }, { status: 500 })
  }
}
