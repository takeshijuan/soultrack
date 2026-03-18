import Replicate from 'replicate'
import {
  MusicGenerationProvider,
  MusicPrompt,
  MusicGenerationStatus,
} from '../types'

const MUSICGEN_MODEL =
  'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043694e0a9dbf6f54e5a51fd5b8f'

export class ReplicateProvider implements MusicGenerationProvider {
  private client: Replicate

  constructor() {
    this.client = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })
  }

  async startGeneration(prompt: MusicPrompt): Promise<string> {
    const prediction = await this.client.predictions.create({
      version: MUSICGEN_MODEL.split(':')[1],
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
        return { status: 'succeeded', audioUrl: audioUrl as string }
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
