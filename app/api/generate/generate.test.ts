import { describe, it, expect } from 'vitest'
import { EMOTION_COLORS } from '@/lib/emotions'
import enMessages from '@/messages/en.json'
import jaMessages from '@/messages/ja.json'
import koMessages from '@/messages/ko.json'
import zhMessages from '@/messages/zh.json'
import zhTWMessages from '@/messages/zh-TW.json'

const Q2_SLUGS = new Set(Object.keys(EMOTION_COLORS))
const Q1_ALL = new Set([
  ...enMessages.pool.q1, ...jaMessages.pool.q1,
  ...koMessages.pool.q1, ...zhMessages.pool.q1, ...zhTWMessages.pool.q1,
])
const Q3_ALL = new Set([
  ...enMessages.pool.q3, ...jaMessages.pool.q3,
  ...koMessages.pool.q3, ...zhMessages.pool.q3, ...zhTWMessages.pool.q3,
])

describe('Generate route allowlist validation', () => {
  it('validates q1 against combined locale Q1 pools', () => {
    expect(Q1_ALL.has('Fresh Start')).toBe(true)      // en
    expect(Q1_ALL.has('再出発')).toBe(true)             // ja
    expect(Q1_ALL.has('새로운 시작')).toBe(true)         // ko
    expect(Q1_ALL.has('invalid_value')).toBe(false)
    expect(Q1_ALL.has('')).toBe(false)
  })

  it('validates q2 against EMOTION_COLORS English slugs', () => {
    expect(Q2_SLUGS.has('calm')).toBe(true)
    expect(Q2_SLUGS.has('anxiety')).toBe(true)
    expect(Q2_SLUGS.has('穏やか')).toBe(false)          // old Japanese key no longer valid
    expect(Q2_SLUGS.has('invalid_value')).toBe(false)
  })

  it('validates q3 against combined locale Q3 pools', () => {
    expect(Q3_ALL.has('A Song to Push You Forward')).toBe(true)  // en
    expect(Q3_ALL.has('背中を押す曲')).toBe(true)                   // ja
    expect(Q3_ALL.has('invalid_value')).toBe(false)
  })

  it('rejects undefined/null values', () => {
    expect(Q1_ALL.has(undefined as unknown as string)).toBe(false)
    expect(Q1_ALL.has(null as unknown as string)).toBe(false)
  })

  it('Q2_SLUGS has exactly 30 emotions', () => {
    expect(Q2_SLUGS.size).toBe(30)
  })
})
