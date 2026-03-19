import Replicate from 'replicate'
import {
  MusicGenerationProvider,
  MusicPrompt,
  MusicGenerationStatus,
} from '../types'

const MUSICGEN_VERSION =
  '671ac645ce5e552cc63a54a2bbff63fcf798043694e0a9dbf6f54e5a51fd5b8f'

export class ReplicateProvider implements MusicGenerationProvider {
  private client: Replicate

  constructor() {
    const token = process.env.REPLICATE_API_TOKEN
    if (!token) throw new Error('REPLICATE_API_TOKEN is not set')
    this.client = new Replicate({ auth: token })
  }

  async startGeneration(prompt: MusicPrompt): Promise<string> {
    const prediction = await this.client.predictions.create({
      version: MUSICGEN_VERSION,
      input: {
        prompt: prompt.description,
        model_version: 'stereo-large',
        output_format: 'mp3',
        duration: prompt.durationSeconds,
        normalization_strategy: 'peak',
      },
    })
    return prediction.id
  }

  async getStatus(predictionId: string): Promise<MusicGenerationStatus> {
    const prediction = await this.client.predictions.get(predictionId)

    switch (prediction.status) {
      case 'succeeded': {
        const audioUrl = Array.isArray(prediction.output)
          ? prediction.output[0]
          : prediction.output
        if (typeof audioUrl !== 'string' || !audioUrl) {
          return { status: 'failed', error: 'No audio URL in response' }
        }
        return { status: 'succeeded', audioUrl }
      }
      case 'failed':
      case 'canceled':
        return {
          status: 'failed',
          error: (prediction.error as string) ?? 'Generation failed',
        }
      default:
        return { status: 'processing' }
    }
  }
}
