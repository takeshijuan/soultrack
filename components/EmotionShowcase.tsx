'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EMOTION_COLORS } from '@/lib/emotions'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.2 } }
}

const chipVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: EASE } }
}

export default function EmotionShowcase() {
  const [active, setActive] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()

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
      <motion.p
        className="text-xs tracking-[0.3em] text-[var(--text-muted)] uppercase mb-4 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        あなたは今、何を感じていますか
      </motion.p>
      <motion.p
        className="text-[var(--text-muted)] text-sm text-center mb-10"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
      >
        タップして背景が変わるのを感じてみてください。
      </motion.p>
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 justify-items-center"
        variants={gridVariants}
        initial={shouldReduceMotion ? 'show' : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        {Object.entries(EMOTION_COLORS).map(([emotion, color]) => {
          const isActive = active === emotion
          return (
            <motion.button
              key={emotion}
              variants={chipVariants}
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
            </motion.button>
          )
        })}
      </motion.div>
    </section>
  )
}
