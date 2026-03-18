'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ShareButtonsProps {
  trackId: string
  title: string
}

export default function ShareButtons({ trackId, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const trackUrl = `${window.location.origin}/track/${trackId}`

  const shareOnX = () => {
    const text = encodeURIComponent(`"${title}" — the music of my moment 🎵 #Soultrack`)
    const url = encodeURIComponent(trackUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(trackUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateAgain = () => {
    router.push('/create')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <button
        type="button"
        onClick={shareOnX}
        className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-medium hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-150 flex items-center justify-center gap-2"
      >
        <span>𝕏</span>
        <span>Share on X</span>
      </button>

      <button
        type="button"
        onClick={copyLink}
        className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-150 flex items-center justify-center gap-2 text-white"
      >
        <span>{copied ? '✓' : '🔗'}</span>
        <span className={copied ? 'text-green-400' : 'text-white'}>
          {copied ? 'Copied!' : 'Copy Link'}
        </span>
      </button>

      <button
        type="button"
        onClick={generateAgain}
        className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-medium hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-150 flex items-center justify-center gap-2"
      >
        <span>✨</span>
        <span>Generate Again</span>
      </button>
    </div>
  )
}
