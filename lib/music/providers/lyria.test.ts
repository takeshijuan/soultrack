import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @google/genai
const mockGenerateContent = vi.fn()
vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = { generateContent: mockGenerateContent }
    constructor(_opts: { apiKey: string }) {}
  },
}))

import { LyriaProvider } from './lyria'

describe('LyriaProvider', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    mockGenerateContent.mockReset()
  })

  it('throws if GEMINI_API_KEY is not set', () => {
    vi.stubEnv('GEMINI_API_KEY', '')
    expect(() => new LyriaProvider()).toThrow('GEMINI_API_KEY is not set')
  })

  describe('generateSync', () => {
    it('returns audio data from Gemini response', async () => {
      const audioBase64 = Buffer.from('fake-audio-data').toString('base64')
      mockGenerateContent.mockResolvedValue({
        candidates: [{
          content: {
            parts: [
              { inlineData: { data: audioBase64, mimeType: 'audio/mp3' } },
              { text: 'Generated lyrics here' },
            ],
          },
        }],
      })

      const provider = new LyriaProvider('pro')
      const result = await provider.generateSync({
        description: 'calm piano ambient',
        durationSeconds: 120,
      })

      expect(result.audioData).toBeInstanceOf(Buffer)
      expect(result.audioData.toString()).toBe('fake-audio-data')
      expect(result.mimeType).toBe('audio/mp3')
      expect(result.lyrics).toBe('Generated lyrics here')
    })

    it('throws when no audio data in response', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [{
          content: {
            parts: [{ text: 'No audio' }],
          },
        }],
      })

      const provider = new LyriaProvider('clip')
      await expect(
        provider.generateSync({ description: 'test', durationSeconds: 30 }),
      ).rejects.toThrow('No audio data in Lyria response')
    })

    it('handles empty candidates', async () => {
      mockGenerateContent.mockResolvedValue({ candidates: [] })

      const provider = new LyriaProvider('pro')
      await expect(
        provider.generateSync({ description: 'test', durationSeconds: 120 }),
      ).rejects.toThrow('No audio data in Lyria response')
    })

    it('uses correct model ID for clip variant', async () => {
      const audioBase64 = Buffer.from('audio').toString('base64')
      mockGenerateContent.mockResolvedValue({
        candidates: [{
          content: {
            parts: [{ inlineData: { data: audioBase64, mimeType: 'audio/mp3' } }],
          },
        }],
      })

      const provider = new LyriaProvider('clip')
      await provider.generateSync({ description: 'test', durationSeconds: 30 })

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'lyria-3-clip-preview' }),
      )
    })

    it('uses correct model ID for pro variant', async () => {
      const audioBase64 = Buffer.from('audio').toString('base64')
      mockGenerateContent.mockResolvedValue({
        candidates: [{
          content: {
            parts: [{ inlineData: { data: audioBase64, mimeType: 'audio/mp3' } }],
          },
        }],
      })

      const provider = new LyriaProvider('pro')
      await provider.generateSync({ description: 'test', durationSeconds: 120 })

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'lyria-3-pro-preview' }),
      )
    })
  })

  describe('startGeneration', () => {
    it('throws because Lyria uses generateSync', async () => {
      const provider = new LyriaProvider()
      await expect(
        provider.startGeneration({ description: 'test', durationSeconds: 30 }),
      ).rejects.toThrow('LyriaProvider uses generateSync')
    })
  })

  describe('getStatus', () => {
    it('throws because Lyria uses generateSync', async () => {
      const provider = new LyriaProvider()
      await expect(provider.getStatus('some-id')).rejects.toThrow(
        'LyriaProvider uses generateSync',
      )
    })
  })
})
