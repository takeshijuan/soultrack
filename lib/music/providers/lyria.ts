import { GoogleGenAI } from '@google/genai'
import {
  MusicGenerationProvider,
  MusicPrompt,
  MusicGenerationStatus,
  MusicGenerationResult,
} from '../types'

const LYRIA_MODELS = {
  clip: 'lyria-3-clip-preview',
  pro: 'lyria-3-pro-preview',
} as const

type LyriaModel = keyof typeof LYRIA_MODELS

export class LyriaProvider implements MusicGenerationProvider {
  private client: GoogleGenAI
  private model: LyriaModel

  constructor(model: LyriaModel = 'pro') {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set')
    this.client = new GoogleGenAI({ apiKey })
    this.model = model
  }

  async generateSync(prompt: MusicPrompt): Promise<MusicGenerationResult> {
    const response = await this.client.models.generateContent({
      model: LYRIA_MODELS[this.model],
      contents: prompt.description,
      config: {
        responseModalities: ['AUDIO', 'TEXT'],
      },
    })

    const parts = response.candidates?.[0]?.content?.parts ?? []
    const audioPart = parts.find(
      (p): p is { inlineData: { data: string; mimeType: string } } =>
        'inlineData' in p && !!p.inlineData,
    )
    const textPart = parts.find(
      (p): p is { text: string } => 'text' in p && !!p.text,
    )

    if (!audioPart?.inlineData) {
      throw new Error('No audio data in Lyria response')
    }

    return {
      audioData: Buffer.from(audioPart.inlineData.data, 'base64'),
      mimeType: audioPart.inlineData.mimeType ?? 'audio/mp3',
      lyrics: textPart?.text,
    }
  }

  async startGeneration(_prompt: MusicPrompt): Promise<string> {
    throw new Error('LyriaProvider uses generateSync, not startGeneration')
  }

  async getStatus(_predictionId: string): Promise<MusicGenerationStatus> {
    throw new Error('LyriaProvider uses generateSync, not getStatus')
  }
}
