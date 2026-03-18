'use client'

import { useState } from 'react'
import { Q1_POOL, Q2_POOL, Q3_POOL } from '@/lib/pool'

interface GachaQuizProps {
  onSubmit: (answers: { q1: string; q2: string; q3: string }) => void
  isLoading: boolean
}

function pickRandom(pool: readonly string[], count: number): string[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

const QUESTIONS = [
  { key: 'q1' as const, label: '今直面していること', pool: Q1_POOL },
  { key: 'q2' as const, label: '今の感情', pool: Q2_POOL },
  { key: 'q3' as const, label: '欲しいサウンド', pool: Q3_POOL },
]

export default function GachaQuiz({ onSubmit, isLoading }: GachaQuizProps) {
  const [choices, setChoices] = useState<Record<'q1' | 'q2' | 'q3', string[]>>({
    q1: pickRandom(Q1_POOL, 5),
    q2: pickRandom(Q2_POOL, 5),
    q3: pickRandom(Q3_POOL, 5),
  })

  const [selected, setSelected] = useState<{ q1: string; q2: string; q3: string }>({
    q1: '',
    q2: '',
    q3: '',
  })

  const reshuffle = (key: 'q1' | 'q2' | 'q3', pool: readonly string[]) => {
    const newChoices = pickRandom(pool, 5)
    setChoices((prev) => ({ ...prev, [key]: newChoices }))
    // Clear selection if it's no longer in the new choices
    setSelected((prev) => ({
      ...prev,
      [key]: newChoices.includes(prev[key]) ? prev[key] : '',
    }))
  }

  const allAnswered = selected.q1 !== '' && selected.q2 !== '' && selected.q3 !== ''

  const handleSubmit = () => {
    if (!isLoading && allAnswered) {
      onSubmit(selected)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {QUESTIONS.map(({ key, label, pool }) => (
        <div
          key={key}
          className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-base">{label}</h2>
            <button
              onClick={() => reshuffle(key, pool)}
              className="text-zinc-400 hover:text-white transition-colors text-xl leading-none"
              aria-label={`${label}の選択肢をシャッフル`}
              type="button"
            >
              🔄
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {choices[key].map((choice) => {
              const isSelected = selected[key] === choice
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => ({
                      ...prev,
                      [key]: isSelected ? '' : choice,
                    }))
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                    isSelected
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-zinc-300 border-zinc-600 hover:border-zinc-400 hover:text-white'
                  }`}
                >
                  {choice}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || isLoading}
        className={`mt-2 w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
          allAnswered && !isLoading
            ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Composing your moment...' : 'Generate My Track'}
      </button>
    </div>
  )
}
