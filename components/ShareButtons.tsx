'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface ShareButtonsProps {
  trackId: string
  title: string
}

export default function ShareButtons({ trackId, title }: ShareButtonsProps) {
  const t = useTranslations('share')
  const [copied, setCopied] = useState(false)

  const shareOnX = () => {
    const url  = `${window.location.origin}/track/${trackId}`
    const text = encodeURIComponent(t('xTemplate', { title }))
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/track/${trackId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buttons = [
    { label: copied ? t('copied') : t('copyLink'), icon: copied ? '✓' : '🔗', onClick: copyLink, accent: copied ? '#60A040' : undefined },
    { label: t('shareOnX'), icon: '𝕏', onClick: shareOnX, accent: undefined },
  ]

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        {buttons.map(({ label, icon, onClick, accent }) => (
          <motion.button
            key={icon}
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
      <div className="mt-4 pt-4 border-t border-[var(--border)] text-center">
        <p className="text-[var(--text-muted)] text-xs mb-3">{t('createSubtext')}</p>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold
                     bg-[var(--accent-teal)] text-black
                     hover:bg-white transition-all duration-300"
        >
          {t('createCta')}
        </Link>
      </div>
    </div>
  )
}
