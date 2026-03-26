import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/kv', () => ({
  getSitemapTrackIds: vi.fn().mockResolvedValue([]),
}))

import sitemap from '@/app/sitemap'

describe('sitemap', () => {
  it('includes /privacy and /terms in static pages', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls.some((u) => u.endsWith('/privacy'))).toBe(true)
    expect(urls.some((u) => u.endsWith('/terms'))).toBe(true)
  })

  it('includes / and /create in static pages', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls.some((u) => u.endsWith('/create'))).toBe(true)
    expect(urls.some((u) => u === 'https://soultrack.io' || u.endsWith('/'))).toBe(true)
  })

  it('sets yearly changeFrequency for legal pages', async () => {
    const entries = await sitemap()
    const privacy = entries.find((e) => e.url.endsWith('/privacy'))
    const terms = entries.find((e) => e.url.endsWith('/terms'))
    expect(privacy?.changeFrequency).toBe('yearly')
    expect(terms?.changeFrequency).toBe('yearly')
  })
})
