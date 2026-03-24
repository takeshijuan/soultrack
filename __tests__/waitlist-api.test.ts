import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/lib/kv', () => ({
  addToWaitlist: vi.fn(),
}))

import { POST } from '@/app/api/waitlist/route'
import { addToWaitlist } from '@/lib/kv'

const makeReq = (body: unknown) =>
  new Request('http://localhost/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('POST /api/waitlist', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns 200 and calls addToWaitlist with normalized email', async () => {
    vi.mocked(addToWaitlist).mockResolvedValueOnce(undefined)
    const res = await POST(makeReq({ email: '  Test@Example.COM  ' }) as Parameters<typeof POST>[0])
    expect(res.status).toBe(200)
    expect(addToWaitlist).toHaveBeenCalledWith('test@example.com')
  })

  it('returns 400 when body is null JSON', async () => {
    const req = new Request('http://localhost/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'null',
    })
    const res = await POST(req as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeReq({}) as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('returns 400 when email is not a string', async () => {
    const res = await POST(makeReq({ email: 123 }) as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('returns 400 when email format is invalid', async () => {
    const res = await POST(makeReq({ email: 'notanemail' }) as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('returns 400 when email has no domain', async () => {
    const res = await POST(makeReq({ email: 'user@' }) as Parameters<typeof POST>[0])
    expect(res.status).toBe(400)
  })

  it('returns 500 when addToWaitlist throws', async () => {
    vi.mocked(addToWaitlist).mockRejectedValueOnce(new Error('KV down'))
    const res = await POST(makeReq({ email: 'test@example.com' }) as Parameters<typeof POST>[0])
    expect(res.status).toBe(500)
  })
})
