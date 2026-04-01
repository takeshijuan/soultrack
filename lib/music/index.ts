import { MusicGenerationProvider } from './types'
import { ReplicateProvider } from './providers/replicate'
import { LyriaProvider } from './providers/lyria'

export function getMusicProvider(
  model?: 'clip' | 'pro',
): MusicGenerationProvider {
  const family = process.env.MUSIC_PROVIDER ?? 'replicate'
  switch (family) {
    case 'replicate':
      return new ReplicateProvider()
    case 'lyria':
      return new LyriaProvider(model ?? 'pro')
    default:
      throw new Error(`Unknown music provider: ${family}`)
  }
}
