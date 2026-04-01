import { describe, it, expect, vi, beforeEach } from 'vitest'

const replicateInstances: unknown[] = []
const lyriaInstances: Array<{ model: string }> = []

vi.mock('./providers/replicate', () => ({
  ReplicateProvider: class MockReplicateProvider {
    constructor() {
      replicateInstances.push(this)
    }
    startGeneration = vi.fn()
    getStatus = vi.fn()
  },
}))

vi.mock('./providers/lyria', () => ({
  LyriaProvider: class MockLyriaProvider {
    model: string
    constructor(model: string = 'pro') {
      this.model = model
      lyriaInstances.push(this)
    }
    generateSync = vi.fn()
    startGeneration = vi.fn()
    getStatus = vi.fn()
  },
}))

import { getMusicProvider } from './index'

describe('getMusicProvider', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    replicateInstances.length = 0
    lyriaInstances.length = 0
  })

  it('returns ReplicateProvider when MUSIC_PROVIDER is replicate', () => {
    vi.stubEnv('MUSIC_PROVIDER', 'replicate')
    getMusicProvider()
    expect(replicateInstances).toHaveLength(1)
  })

  it('returns LyriaProvider with clip model', () => {
    vi.stubEnv('MUSIC_PROVIDER', 'lyria')
    getMusicProvider('clip')
    expect(lyriaInstances).toHaveLength(1)
    expect(lyriaInstances[0].model).toBe('clip')
  })

  it('returns LyriaProvider with pro model', () => {
    vi.stubEnv('MUSIC_PROVIDER', 'lyria')
    getMusicProvider('pro')
    expect(lyriaInstances).toHaveLength(1)
    expect(lyriaInstances[0].model).toBe('pro')
  })

  it('defaults to pro model when no model specified', () => {
    vi.stubEnv('MUSIC_PROVIDER', 'lyria')
    getMusicProvider()
    expect(lyriaInstances).toHaveLength(1)
    expect(lyriaInstances[0].model).toBe('pro')
  })

  it('throws for unknown provider', () => {
    vi.stubEnv('MUSIC_PROVIDER', 'unknown')
    expect(() => getMusicProvider()).toThrow('Unknown music provider: unknown')
  })
})
