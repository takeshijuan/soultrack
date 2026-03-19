'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface ShareButtonsProps {
  trackId: string
  title: string
}

export default function ShareButtons({ trackId, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const shareOnX = () => {
    const url  = `${window.location.origin}/track/${trackId}`
    const text = encodeURIComponent(`"${title}" — the music of my moment 🎵 #Soultrack`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/track/${trackId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buttons = [
    { label: copied ? 'Copied!' : 'Copy Link', icon: copied ? '✓' : '🔗', onClick: copyLink,                   accent: copied ? '#60A040' : undefined },
    { label: 'Share on X',                     icon: '𝕏',                  onClick: shareOnX,                   accent: undefined },
    { label: 'Again',                           icon: '✦',                  onClick: () => router.push('/create'), accent: undefined },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {buttons.map(({ label, icon, onClick, accent }) => (
        <motion.button
          key={label}
          type="button"
          onClick={onClick}
          whileTap={{ scale: 0.97 }}
          className="flex-1 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200"
          style={{
            background: 'var(--surface-2)',
            border: `1px solid ${accent ? `${accent}60` : 'var(--border)'}`,
            color: accent ?? 'var(--text-muted)',
          }}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </motion.button>
      ))}
    </div>
  )
}
