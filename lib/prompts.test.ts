import { describe, it, expect } from 'vitest'
import { parseClaudeResponse, buildClaudePrompt } from './prompts'

describe('parseClaudeResponse', () => {
  it('parses a valid JSON response', () => {
    const raw = JSON.stringify({
      musicPrompt: 'melancholic ambient piano, 60bpm, 20 seconds',
      title: '霧と光の間で',
      copy: 'A piece born from transformation.',
    })
    const result = parseClaudeResponse(raw)
    expect(result.musicPrompt).toBe('melancholic ambient piano, 60bpm, 20 seconds')
    expect(result.title).toBe('霧と光の間で')
    expect(result.copy).toBe('A piece born from transformation.')
  })

  it('throws PARSE_FAILED on invalid JSON', () => {
    expect(() => parseClaudeResponse('not json')).toThrow('PARSE_FAILED')
  })

  it('throws PARSE_FAILED when musicPrompt is missing', () => {
    const raw = JSON.stringify({ title: 'Test', copy: 'Test copy' })
    expect(() => parseClaudeResponse(raw)).toThrow('PARSE_FAILED')
  })

  it('throws PARSE_FAILED when title is missing', () => {
    const raw = JSON.stringify({ musicPrompt: 'test prompt', copy: 'Test copy' })
    expect(() => parseClaudeResponse(raw)).toThrow('PARSE_FAILED')
  })

  it('throws PARSE_FAILED when copy is missing', () => {
    const raw = JSON.stringify({ musicPrompt: 'test prompt', title: 'Test title' })
    expect(() => parseClaudeResponse(raw)).toThrow('PARSE_FAILED')
  })

  it('throws PARSE_FAILED when a field is empty string', () => {
    const raw = JSON.stringify({ musicPrompt: '', title: 'Test', copy: 'Test' })
    expect(() => parseClaudeResponse(raw)).toThrow('PARSE_FAILED')
  })
})

describe('buildClaudePrompt', () => {
  it('returns system and user strings', () => {
    const { system, user } = buildClaudePrompt('再出発', '穏やか', '背中を押す曲')
    expect(typeof system).toBe('string')
    expect(system.length).toBeGreaterThan(0)
    expect(typeof user).toBe('string')
    expect(user).toContain('再出発')
    expect(user).toContain('穏やか')
    expect(user).toContain('背中を押す曲')
  })
})
