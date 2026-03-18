import { describe, it, expect } from 'vitest'
import { Q1_POOL, Q2_POOL, Q3_POOL, Q1_SET, Q2_SET, Q3_SET, ALL_POOLS } from './pool'

describe('Pool data', () => {
  describe('Q1_POOL', () => {
    it('has exactly 30 items', () => {
      expect(Q1_POOL).toHaveLength(30)
    })
    it('has no duplicates', () => {
      expect(new Set(Q1_POOL).size).toBe(30)
    })
    it('Q1_SET matches Q1_POOL', () => {
      expect(Q1_SET.size).toBe(30)
      Q1_POOL.forEach(item => expect(Q1_SET.has(item)).toBe(true))
    })
  })

  describe('Q2_POOL', () => {
    it('has exactly 30 items', () => {
      expect(Q2_POOL).toHaveLength(30)
    })
    it('has no duplicates', () => {
      expect(new Set(Q2_POOL).size).toBe(30)
    })
    it('Q2_SET matches Q2_POOL', () => {
      expect(Q2_SET.size).toBe(30)
      Q2_POOL.forEach(item => expect(Q2_SET.has(item)).toBe(true))
    })
  })

  describe('Q3_POOL', () => {
    it('has exactly 30 items', () => {
      expect(Q3_POOL).toHaveLength(30)
    })
    it('has no duplicates', () => {
      expect(new Set(Q3_POOL).size).toBe(30)
    })
    it('Q3_SET matches Q3_POOL', () => {
      expect(Q3_SET.size).toBe(30)
      Q3_POOL.forEach(item => expect(Q3_SET.has(item)).toBe(true))
    })
  })

  describe('ALL_POOLS', () => {
    it('contains q1, q2, q3', () => {
      expect(ALL_POOLS.q1).toBe(Q1_POOL)
      expect(ALL_POOLS.q2).toBe(Q2_POOL)
      expect(ALL_POOLS.q3).toBe(Q3_POOL)
    })
  })
})
