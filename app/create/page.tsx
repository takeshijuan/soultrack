'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GachaQuiz from '@/components/GachaQuiz'
import { useTranslations } from 'next-intl'

export default function CreatePage() {
  const router = useRouter()
  const t = useTranslations('create')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(answers: { q1: string; q2: string; q3: string }) {
    setIsLoading(true)
    setError(null)
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
    <main className="ambient-bg min-h-screen text-[var(--text-primary)]">
      <div className="ambient-content max-w-xl mx-auto px-5 py-10">

        {/* Nav */}
        <div className="mb-10">
          <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors">
            {t('back')}
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--text-primary)] leading-tight mb-2">
            {t('header')}
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            {t('subtext')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <GachaQuiz onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </main>
  )
}
