export interface MusicPrompt {
  description: string
  durationSeconds?: number
  structure?: string
}

export type MusicGenerationStatus =
  | { status: 'processing' }
  | { status: 'succeeded'; audioUrl: string }
  | { status: 'failed'; error: string }

export interface MusicGenerationResult {
  audioData: Buffer
  mimeType: string
  lyrics?: string
}

export interface MusicGenerationProvider {
  startGeneration(prompt: MusicPrompt): Promise<string> // returns predictionId
  getStatus(predictionId: string): Promise<MusicGenerationStatus>
  generateSync?(prompt: MusicPrompt): Promise<MusicGenerationResult>
}
