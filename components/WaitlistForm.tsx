'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type FormState = 'idle' | 'loading' | 'success' | 'error'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      })
      if (res.ok) { setEmail(''); setState('success') } else { setState('error') }
    } catch {
      setState('error')
    } finally {
      clearTimeout(timeout)
    }
  }

  return (
    <div className="relative">
      {/* Emotion-reactive ambient glow ring — reacts to --emotion-hue like header logo */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl pointer-events-none transition-all duration-[800ms]"
        style={{ boxShadow: '0 0 80px 0 var(--emotion-hue, #00F5D4)', opacity: 0.07 }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {state === 'success' ? (
          <motion.p
            key="success"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="text-[var(--accent-teal)] text-sm text-center py-4 leading-relaxed"
          >
            ✓ You&apos;re on the list. We&apos;ll let you know when member accounts launch.
          </motion.p>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={state === 'loading'}
                className="flex-1 px-4 py-2 rounded-full bg-[var(--surface-1)]
                           border border-[var(--border)] text-sm text-[var(--text-primary)]
                           placeholder-[var(--text-muted)] focus:outline-none
                           transition-[border-color,box-shadow] duration-[800ms]
                           focus:border-[var(--emotion-hue,#00F5D4)]
                           disabled:opacity-50"
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--emotion-hue, #00F5D4)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = ''
                }}
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                aria-label={state === 'loading' ? 'Loading' : undefined}
                className="px-4 py-2 rounded-full bg-[var(--accent-teal)] text-black
                           text-sm font-medium whitespace-nowrap min-w-[130px]
                           hover:bg-white transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === 'loading' ? (
                  <span className="dot-bounce inline-flex items-center justify-center gap-[3px]">
                    <span /><span /><span />
                  </span>
                ) : (
                  'Get Early Access'
                )}
              </button>
            </form>

            <AnimatePresence>
              {state === 'error' && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="text-red-400 text-xs text-center"
                >
                  Something went wrong. Please try again.
                </motion.p>
              )}
            </AnimatePresence>

            <p className="text-[var(--text-muted)] text-[10px] text-center tracking-[0.2em] uppercase">
              No spam &middot; Unsubscribe anytime
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
