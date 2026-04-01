'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { EMOTION_COLORS } from '@/lib/emotions'
import { trackEvent, EVENTS } from '@/lib/analytics'

interface GachaQuizProps {
  onSubmit: (answers: { q1: string; q2: string; q3: string; duration: number }) => void
  isLoading: boolean
}

function pickRandom(pool: readonly string[], count: number): string[] {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count)
}

// Q1=teal, Q2=emotion color (dynamic), Q3=amber
const QUESTION_ACCENT: Record<'q1' | 'q2' | 'q3', string> = {
  q1: '#00F5D4',
  q2: '#00F5D4', // overridden dynamically from EMOTION_COLORS
  q3: '#FF9A3C',
}

export default function GachaQuiz({ onSubmit, isLoading }: GachaQuizProps) {
  const t = useTranslations()
  const q1Pool = t.raw('pool.q1') as string[]
  const q2Pool = t.raw('pool.q2') as string[]
  const q3Pool = t.raw('pool.q3') as string[]
  const QUESTIONS = [
    { key: 'q1' as const, label: t('quiz.q1Label'), pool: q1Pool },
    { key: 'q2' as const, label: t('quiz.q2Label'), pool: q2Pool },
    { key: 'q3' as const, label: t('quiz.q3Label'), pool: q3Pool },
  ]

  const [choices, setChoices] = useState<Record<'q1' | 'q2' | 'q3', string[]>>(() => ({
    q1: pickRandom(q1Pool, 5),
    q2: pickRandom(q2Pool, 5),
    q3: pickRandom(q3Pool, 5),
  }))
  const [selected, setSelected] = useState<{ q1: string; q2: string; q3: string }>({
    q1: '', q2: '', q3: '',
  })
  const [shuffleKeys, setShuffleKeys] = useState<Record<'q1' | 'q2' | 'q3', number>>({
    q1: 0, q2: 0, q3: 0,
  })
  const [duration, setDuration] = useState<30 | 120>(120)

  const reshuffle = (key: 'q1' | 'q2' | 'q3', pool: readonly string[]) => {
    const newChoices = pickRandom(pool, 5)
    setChoices(prev => ({ ...prev, [key]: newChoices }))
    setShuffleKeys(prev => ({ ...prev, [key]: prev[key] + 1 }))
    setSelected(prev => ({
      ...prev,
      [key]: newChoices.includes(prev[key]) ? prev[key] : '',
    }))
  }

  const handleChipSelect = (key: 'q1' | 'q2' | 'q3', choice: string, isSelected: boolean) => {
    const newVal = isSelected ? '' : choice
    setSelected(prev => ({ ...prev, [key]: newVal }))
    if (!isSelected) {
      const eventMap = { q1: EVENTS.Q1_ANSWER, q2: EVENTS.Q2_ANSWER, q3: EVENTS.Q3_ANSWER }
      trackEvent(eventMap[key], { value: choice })
    }

    // Emotion-reactive background (Q2 only)
    if (key === 'q2' && !isSelected) {
      const color = EMOTION_COLORS[choice] ?? '#00F5D4'
      document.documentElement.style.setProperty('--emotion-hue', color)
    } else if (key === 'q2' && isSelected) {
      document.documentElement.style.setProperty('--emotion-hue', '#00F5D4')
    }
  }

  const allAnswered = selected.q1 !== '' && selected.q2 !== '' && selected.q3 !== ''

  return (
    <div className="flex flex-col gap-4 w-full">
      {QUESTIONS.map(({ key, label, pool }, cardIdx) => {
        const accentColor = key === 'q2' && selected.q2
          ? (EMOTION_COLORS[selected.q2] ?? QUESTION_ACCENT.q2)
          : QUESTION_ACCENT[key]

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: cardIdx * 0.12, duration: 0.45, ease: 'easeOut' }}
            className="rounded-2xl p-5"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[var(--text-primary)] font-semibold text-sm tracking-wide">
                {label}
              </h2>
              <motion.button
                key={shuffleKeys[key]}
                onClick={() => reshuffle(key, pool)}
                aria-label={`${t('quiz.shuffleLabel')} ${label}`}
                type="button"
                className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-white/5"
                initial={{ rotate: 0 }}
                animate={{ rotate: shuffleKeys[key] * 180 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                ↻
              </motion.button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
              {choices[key].map(choice => {
                const isSel = selected[key] === choice
                const chipLabel = key === 'q2' ? t(`emotions.${choice}`) : choice
                return (
                  <motion.button
                    key={choice}
                    type="button"
                    role="radio"
                    aria-checked={isSel}
                    onClick={() => handleChipSelect(key, choice, isSel)}
                    whileTap={{ scale: 0.96 }}
                    animate={isSel ? { scale: 1.04 } : { scale: 1 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="px-4 py-3 rounded-full text-sm font-medium transition-colors duration-200"
                    style={isSel ? {
                      background: `${accentColor}18`,
                      border: `1px solid ${accentColor}`,
                      color: accentColor,
                      boxShadow: `0 0 18px ${accentColor}30, 0 0 4px ${accentColor}18`,
                    } : {
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {chipLabel}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )
      })}

      {/* Duration selection */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.45, ease: 'easeOut' }}
        className="rounded-2xl p-5"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
        }}
      >
        <h2 className="text-[var(--text-primary)] font-semibold text-sm tracking-wide mb-4">
          {t('quiz.durationLabel')}
        </h2>
        <div className="flex gap-3" role="radiogroup" aria-label={t('quiz.durationLabel')}>
          {([30, 120] as const).map(d => {
            const isSel = duration === d
            return (
              <motion.button
                key={d}
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => { setDuration(d); trackEvent(EVENTS.DURATION_SELECT, { duration: d }) }}
                whileTap={{ scale: 0.96 }}
                animate={isSel ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl text-sm font-medium transition-colors duration-200"
                style={isSel ? {
                  background: 'rgba(0,245,212,0.08)',
                  border: '1px solid var(--accent-teal)',
                  color: 'var(--accent-teal)',
                  boxShadow: '0 0 18px rgba(0,245,212,0.18), 0 0 4px rgba(0,245,212,0.1)',
                } : {
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                <span className="text-lg font-semibold">{d === 30 ? '30s' : '2min'}</span>
                <span className="text-xs opacity-70">
                  {d === 30 ? t('quiz.durationQuick') : t('quiz.durationFull')}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Submit */}
      <motion.button
        type="button"
        onClick={() => !isLoading && allAnswered && onSubmit({ ...selected, duration })}
        disabled={!allAnswered || isLoading}
        className="mt-3 w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300"
        animate={allAnswered && !isLoading ? {
          boxShadow: ['0 0 0px rgba(0,245,212,0)', '0 0 30px rgba(0,245,212,0.25)', '0 0 0px rgba(0,245,212,0)'],
        } : {}}
        transition={allAnswered && !isLoading ? { duration: 2, repeat: Infinity } : {}}
        style={allAnswered && !isLoading ? {
          background: 'var(--accent-teal)',
          color: '#000',
          cursor: 'pointer',
        } : {
          background: 'var(--surface-2)',
          color: 'var(--text-muted)',
          cursor: 'not-allowed',
        }}
      >
        {isLoading ? t('quiz.generatingButton') : t('quiz.generateButton')}
      </motion.button>
    </div>
  )
}
