import { describe, it, expect } from 'vitest'
import { Q1_SET, Q2_SET, Q3_SET } from '@/lib/pool'

describe('Generate route allowlist validation', () => {
  it('validates q1 against Q1_SET', () => {
    expect(Q1_SET.has('再出発')).toBe(true)
    expect(Q1_SET.has('invalid_value')).toBe(false)
    expect(Q1_SET.has('')).toBe(false)
  })

  it('validates q2 against Q2_SET', () => {
    expect(Q2_SET.has('穏やか')).toBe(true)
    expect(Q2_SET.has('invalid_value')).toBe(false)
  })

  it('validates q3 against Q3_SET', () => {
    expect(Q3_SET.has('背中を押す曲')).toBe(true)
    expect(Q3_SET.has('invalid_value')).toBe(false)
  })

  it('rejects undefined/null values', () => {
    expect(Q1_SET.has(undefined as unknown as string)).toBe(false)
    expect(Q1_SET.has(null as unknown as string)).toBe(false)
  })
})
