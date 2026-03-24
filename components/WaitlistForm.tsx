'use client'
import { useState } from 'react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) { setEmail(''); setState('success') } else { setState('error') }
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <p className="text-[var(--accent-teal)] text-sm text-center">
        ✓ You&apos;re on the list. We&apos;ll let you know when member accounts launch.
      </p>
    )
  }

  return (
    <div className="space-y-3">
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
                     focus:border-[var(--accent-teal)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="px-4 py-2 rounded-full bg-[var(--accent-teal)] text-black
                     text-sm font-medium whitespace-nowrap
                     hover:bg-white transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === 'loading' ? '...' : 'Get Early Access'}
        </button>
      </form>
      {state === 'error' && (
        <p className="text-red-400 text-xs text-center">
          Something went wrong. Please try again.
        </p>
      )}
      <p className="text-[var(--text-muted)] text-xs text-center tracking-widest">
        No spam · Unsubscribe anytime
      </p>
    </div>
  )
}
