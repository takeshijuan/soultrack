import { describe, it, expect } from 'vitest'
import { resolveLocale } from './locale'

describe('resolveLocale', () => {
  it('returns locale from cookie when valid', () => {
    expect(resolveLocale('ja', undefined)).toBe('ja')
    expect(resolveLocale('ko', undefined)).toBe('ko')
    expect(resolveLocale('zh', undefined)).toBe('zh')
    expect(resolveLocale('zh-TW', undefined)).toBe('zh-TW')
    expect(resolveLocale('en', undefined)).toBe('en')
  })

  it('falls back to Accept-Language when no cookie', () => {
    expect(resolveLocale(undefined, 'ja,en;q=0.9')).toBe('ja')
    expect(resolveLocale(undefined, 'ko-KR,ko;q=0.9,en;q=0.8')).toBe('ko')
    expect(resolveLocale(undefined, 'zh-TW,zh;q=0.9')).toBe('zh-TW')
    expect(resolveLocale(undefined, 'zh-Hant,en;q=0.5')).toBe('zh-TW')
    expect(resolveLocale(undefined, 'zh-CN,zh;q=0.9')).toBe('zh')
  })

  it('returns en when both cookie and Accept-Language are missing', () => {
    expect(resolveLocale(undefined, undefined)).toBe('en')
  })

  it('returns en for invalid cookie values', () => {
    expect(resolveLocale('fr', undefined)).toBe('en')
    expect(resolveLocale('de', undefined)).toBe('en')
    expect(resolveLocale('', undefined)).toBe('en')
  })

  it('returns en for prototype pollution attempts', () => {
    expect(resolveLocale('__proto__', undefined)).toBe('en')
    expect(resolveLocale('constructor', undefined)).toBe('en')
    expect(resolveLocale('toString', undefined)).toBe('en')
  })

  it('cookie takes priority over Accept-Language', () => {
    expect(resolveLocale('ja', 'en-US,en;q=0.9')).toBe('ja')
    expect(resolveLocale('en', 'ja,en;q=0.9')).toBe('en')
  })
})
