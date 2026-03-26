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

  it('parses JSON wrapped in markdown code fences', () => {
    const json = JSON.stringify({
      musicPrompt: 'melancholic ambient piano, 60bpm, 20 seconds',
      title: '霧と光の間で',
      copy: 'A piece born from transformation.',
    })
    const result = parseClaudeResponse('```json\n' + json + '\n```')
    expect(result.musicPrompt).toBe('melancholic ambient piano, 60bpm, 20 seconds')
  })

  it('parses JSON wrapped in plain code fences', () => {
    const json = JSON.stringify({
      musicPrompt: 'melancholic ambient piano, 60bpm, 20 seconds',
      title: '霧と光の間で',
      copy: 'A piece born from transformation.',
    })
    const result = parseClaudeResponse('```\n' + json + '\n```')
    expect(result.musicPrompt).toBe('melancholic ambient piano, 60bpm, 20 seconds')
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
  it('returns system and user strings with user inputs', () => {
    const { system, user } = buildClaudePrompt('再出発', '穏やか', '背中を押す曲')
    expect(typeof system).toBe('string')
    expect(system.length).toBeGreaterThan(0)
    expect(typeof user).toBe('string')
    expect(user).toContain('再出発')
    expect(user).toContain('穏やか')
    expect(user).toContain('背中を押す曲')
  })

  it('defaults to English locale', () => {
    const { system, user } = buildClaudePrompt('test', 'calm', 'soft')
    expect(system).toContain('Generate the title and copy in English')
    expect(system).toContain('musicPrompt must always be in English')
    expect(user).toContain('Between Fog and Light')
  })

  it('generates Japanese prompt for ja locale', () => {
    const { system, user } = buildClaudePrompt('test', 'calm', 'soft', 'ja')
    expect(system).toContain('Generate the title and copy in Japanese')
    expect(user).toContain('霧と光の間で')
  })

  it('generates Korean prompt for ko locale', () => {
    const { system, user } = buildClaudePrompt('test', 'calm', 'soft', 'ko')
    expect(system).toContain('Generate the title and copy in Korean')
    expect(user).toContain('안개와 빛 사이에서')
  })

  it('generates Simplified Chinese prompt for zh locale', () => {
    const { system, user } = buildClaudePrompt('test', 'calm', 'soft', 'zh')
    expect(system).toContain('Generate the title and copy in Simplified Chinese')
    expect(user).toContain('雾与光之间')
  })

  it('generates Traditional Chinese prompt for zh-TW locale', () => {
    const { system, user } = buildClaudePrompt('test', 'calm', 'soft', 'zh-TW')
    expect(system).toContain('Generate the title and copy in Traditional Chinese')
    expect(user).toContain('霧與光之間')
  })

  it('always includes English musicPrompt example regardless of locale', () => {
    for (const locale of ['en', 'ja', 'ko', 'zh', 'zh-TW'] as const) {
      const { user } = buildClaudePrompt('test', 'calm', 'soft', locale)
      expect(user).toContain('melancholic ambient piano')
    }
  })
})
