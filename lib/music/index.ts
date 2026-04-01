import { MusicGenerationProvider } from './types'
import { ReplicateProvider } from './providers/replicate'
import { LyriaProvider } from './providers/lyria'

export function getMusicProvider(
  durationSeconds?: number,
): MusicGenerationProvider {
  const family = process.env.MUSIC_PROVIDER ?? 'replicate'
  switch (family) {
    case 'replicate':
      return new ReplicateProvider()
    case 'lyria': {
      const model = durationSeconds && durationSeconds <= 30 ? 'clip' : 'pro'
      return new LyriaProvider(model)
    }
    default:
      throw new Error(`Unknown music provider: ${family}`)
  }
}
