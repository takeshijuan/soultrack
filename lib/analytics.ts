import posthog from 'posthog-js'

export const EVENTS = {
  QUIZ_START: 'quiz_start',
  Q1_ANSWER: 'q1_answer',
  Q2_ANSWER: 'q2_answer',
  Q3_ANSWER: 'q3_answer',
  DURATION_SELECT: 'duration_select',
  GENERATION_START: 'generation_start',
  GENERATION_COMPLETE: 'generation_complete',
  TRACK_PLAY: 'track_play',
  TRACK_REPLAY: 'track_replay',
  TRACK_SAVE: 'track_save',
  TRACK_SHARE: 'track_share',
  SESSION_RETURN: 'session_return',
} as const

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(event, properties)
  }
}
