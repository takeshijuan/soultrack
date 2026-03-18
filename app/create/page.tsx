'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GachaQuiz from '@/components/GachaQuiz'

export default function CreatePage() {
  const router = useRouter()
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
        setError('3 tracks per day. Come back tomorrow.')
        setIsLoading(false)
        return
      }
      if (!res.ok) {
        setError('Something went wrong. Try again.')
        setIsLoading(false)
        return
      }
      const { trackId } = await res.json()
      router.push(`/track/${trackId}`)
    } catch {
      setError('Something went wrong. Try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8 text-center">Your Moment</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}
        <GachaQuiz onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </main>
  )
}
