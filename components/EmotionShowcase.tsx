'use client'

import { useState, useEffect } from 'react'
import { EMOTION_COLORS } from '@/lib/emotions'

export default function EmotionShowcase() {
  const [active, setActive] = useState<string | null>(null)

  // Reset CSS variable on unmount to prevent color leak to other pages
  useEffect(() => {
    return () => { document.documentElement.style.removeProperty('--emotion-hue') }
  }, [])

  const handleClick = (emotion: string, color: string) => {
    const next = active === emotion ? null : emotion
    setActive(next)
    document.documentElement.style.setProperty(
      '--emotion-hue',
      next ? color : '#00F5D4'
    )
  }

  return (
    <section className="w-full max-w-3xl mx-auto px-6 pb-24">
      <p className="text-xs tracking-[0.3em] text-[var(--text-muted)] uppercase mb-4 text-center">
        あなたは今、何を感じていますか
      </p>
      <p className="text-[var(--text-muted)] text-sm text-center mb-10">
        タップして背景が変わるのを感じてみてください。
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 justify-items-center">
        {Object.entries(EMOTION_COLORS).map(([emotion, color]) => {
          const isActive = active === emotion
          return (
            <button
              key={emotion}
              type="button"
              aria-label={`${emotion}を試す`}
              aria-pressed={isActive}
              onClick={() => handleClick(emotion, color)}
              className="px-3 py-2.5 rounded-full text-sm font-medium transition-all duration-200 min-w-[72px] text-center"
              style={isActive ? {
                background: `${color}22`,
                border: `1px solid ${color}`,
                color,
                boxShadow: `0 0 18px ${color}30`,
              } : {
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              {emotion}
            </button>
          )
        })}
      </div>
    </section>
  )
}
