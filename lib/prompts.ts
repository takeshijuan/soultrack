export function buildClaudePrompt(
  q1: string,
  q2: string,
  q3: string,
): { system: string; user: string } {
  const system =
    'You are a music director who translates emotional states into precise musical descriptions and poetic titles. Be specific, evocative, non-generic.'

  const user = `User's current state:
- Facing: "${q1}"
- Feeling: "${q2}"
- Sound needed: "${q3}"

Respond with valid JSON only (no markdown, no explanation):
{
  "musicPrompt": "melancholic ambient piano with sparse strings, slow 60bpm, 20 seconds, fading in gently",
  "title": "霧と光の間で",
  "copy": "A piece born from transformation and stillness — the quiet before clarity arrives."
}`

  return { system, user }
}

export function parseClaudeResponse(raw: string): {
  musicPrompt: string
  title: string
  copy: string
} {
  try {
    const parsed = JSON.parse(raw)
    if (
      typeof parsed.musicPrompt !== 'string' || !parsed.musicPrompt ||
      typeof parsed.title !== 'string' || !parsed.title ||
      typeof parsed.copy !== 'string' || !parsed.copy
    ) {
      throw new Error('PARSE_FAILED')
    }
    return { musicPrompt: parsed.musicPrompt, title: parsed.title, copy: parsed.copy }
  } catch {
    throw new Error('PARSE_FAILED')
  }
}
