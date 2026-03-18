import { MusicGenerationProvider } from './types'
import { ReplicateProvider } from './providers/replicate'

export function getMusicProvider(): MusicGenerationProvider {
  const provider = process.env.MUSIC_PROVIDER ?? 'replicate'
  switch (provider) {
    case 'replicate':
      return new ReplicateProvider()
    default:
      throw new Error(`Unknown music provider: ${provider}`)
  }
}
