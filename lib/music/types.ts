export interface MusicPrompt {
  description: string
  durationSeconds: number
}

export type MusicGenerationStatus =
  | { status: 'processing' }
  | { status: 'succeeded'; audioUrl: string }
  | { status: 'failed'; error: string }

export interface MusicGenerationProvider {
  startGeneration(prompt: MusicPrompt): Promise<string> // returns predictionId
  getStatus(predictionId: string): Promise<MusicGenerationStatus>
}
