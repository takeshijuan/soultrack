import { type Locale } from '@/lib/locale'

const LANG_MAP: Record<Locale, string> = {
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
}

const EXAMPLE_BY_LOCALE: Record<Locale, { title: string; copy: string }> = {
  en: {
    title: 'Between Fog and Light',
    copy: 'A piece born from transformation and stillness — the quiet before clarity arrives.',
  },
  ja: {
    title: '霧と光の間で',
    copy: '変化と静寂から生まれた一曲——明晰さが訪れる前の静けさ。',
  },
  ko: {
    title: '안개와 빛 사이에서',
    copy: '변화와 고요에서 태어난 곡 — 명료함이 찾아오기 전의 정적.',
  },
  zh: {
    title: '雾与光之间',
    copy: '一首诞生于变化与寂静之中的曲子——清明到来之前的宁静。',
  },
  'zh-TW': {
    title: '霧與光之間',
    copy: '一首誕生於變化與寂靜之中的曲子——清明到來之前的寧靜。',
  },
}

export function buildClaudePrompt(
  q1: string,
  q2: string,
  q3: string,
  locale: Locale = 'en',
): { system: string; user: string } {
  const lang = LANG_MAP[locale]
  const example = EXAMPLE_BY_LOCALE[locale]

  const system =
    `You are a music director who translates emotional states into precise musical descriptions and poetic titles. Be specific, evocative, non-generic. Generate the title and copy in ${lang}. The musicPrompt must always be in English (it is fed to an audio model).`

  const user = `User's current state:
- Facing: "${q1}"
- Feeling: "${q2}"
- Sound needed: "${q3}"

Respond with valid JSON only (no markdown, no explanation):
{
  "musicPrompt": "melancholic ambient piano with sparse strings, slow 60bpm, 20 seconds, fading in gently",
  "title": ${JSON.stringify(example.title)},
  "copy": ${JSON.stringify(example.copy)}
}`

  return { system, user }
}

export function parseClaudeResponse(raw: string): {
  musicPrompt: string
  title: string
  copy: string
} {
  try {
    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    const parsed = JSON.parse(stripped)
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
