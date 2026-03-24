import { describe, it, expect, vi } from 'vitest'

// next-auth をモック（Edgeランタイム非互換のため）
vi.mock('next-auth', () => ({
  default: (_config: unknown) => ({ auth: vi.fn() }),
}))

import { detectLocale } from '@/middleware'

const makeReq = (opts: { lang?: string; cookie?: string; acceptLang?: string }) => ({
  nextUrl: { searchParams: { get: (k: string) => k === 'lang' ? (opts.lang ?? null) : null } },
  cookies: { get: (k: string) => opts.cookie ? { value: opts.cookie } : undefined },
  headers: { get: (k: string) => k === 'accept-language' ? (opts.acceptLang ?? null) : null },
}) as any

describe('detectLocale', () => {
  it('returns lang param when valid', () =>
    expect(detectLocale(makeReq({ lang: 'ja' }))).toBe('ja'))

  it('ignores invalid lang param, falls to cookie', () =>
    expect(detectLocale(makeReq({ lang: 'fr', cookie: 'ko' }))).toBe('ko'))

  it('returns cookie locale when no valid param', () =>
    expect(detectLocale(makeReq({ cookie: 'zh-TW' }))).toBe('zh-TW'))

  it('detects Japanese from Accept-Language header', () =>
    expect(detectLocale(makeReq({ acceptLang: 'ja-JP,ja;q=0.9,en;q=0.8' }))).toBe('ja'))

  it('detects zh-TW from Accept-Language', () =>
    expect(detectLocale(makeReq({ acceptLang: 'zh-TW,zh;q=0.9' }))).toBe('zh-TW'))

  it('falls back to en when nothing matches', () =>
    expect(detectLocale(makeReq({}))).toBe('en'))
})
