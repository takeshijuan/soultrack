'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import GachaQuiz from '@/components/GachaQuiz'
import { trackEvent, EVENTS } from '@/lib/analytics'

export default function CreateForm() {
  const router = useRouter()
  const t = useTranslations('create')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(answers: { q1: string; q2: string; q3: string; trackSize: string }) {
    setIsLoading(true)
    setError(null)
    trackEvent(EVENTS.GENERATION_START, { trackSize: answers.trackSize, emotion: answers.q2 })
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (res.status === 429) {
        setError(t('limitError'))
        setIsLoading(false)
        return
      }
      if (!res.ok) {
        setError(t('genericError'))
        setIsLoading(false)
        return
      }
      const { trackId } = await res.json()
      router.push(`/track/${trackId}`)
    } catch {
      setError(t('genericError'))
      setIsLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      <GachaQuiz onSubmit={handleSubmit} isLoading={isLoading} />
    </>
  )
}
