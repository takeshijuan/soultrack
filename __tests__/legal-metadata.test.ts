import { describe, it, expect, vi } from 'vitest'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => (key: string) => key),
}))

describe('legal page metadata', () => {
  it('/privacy metadata does not include noindex', async () => {
    const { generateMetadata } = await import('@/app/privacy/page')
    const metadata = await generateMetadata()
    expect(metadata).not.toHaveProperty('robots')
  })

  it('/terms metadata does not include noindex', async () => {
    const { generateMetadata } = await import('@/app/terms/page')
    const metadata = await generateMetadata()
    expect(metadata).not.toHaveProperty('robots')
  })
})
