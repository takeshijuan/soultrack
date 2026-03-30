'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import DeleteTrackButton from '@/components/DeleteTrackButton'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE },
  },
}

interface TrackItem {
  trackId: string
  title: string
  emotion?: string
  emotionLabel?: string
  emotionColor?: string
  createdAt: number
}

export function formatRelativeTime(
  createdAt: number,
  t: ReturnType<typeof useTranslations>,
): string {
  if (!createdAt) return ''
  const diff = Math.floor((Date.now() - createdAt) / 1000)
  if (diff < 60) return t('timeJustNow')
  if (diff < 3600) return t('timeMinutesAgo', { count: Math.floor(diff / 60) })
  if (diff < 86400) return t('timeHoursAgo', { count: Math.floor(diff / 3600) })
  if (diff < 604800) return t('timeDaysAgo', { count: Math.floor(diff / 86400) })
  return t('timeWeeksAgo', { count: Math.floor(diff / 604800) })
}

export default function TrackList({ tracks }: { tracks: TrackItem[] }) {
  const shouldReduceMotion = useReducedMotion()
  const t = useTranslations('library')

  return (
    <motion.div
      className="flex flex-col gap-3"
      variants={container}
      initial={shouldReduceMotion ? 'show' : 'hidden'}
      animate="show"
    >
      {tracks.map((track, i) => {
        const color = track.emotionColor ?? 'var(--accent-teal)'
        const useAnimation = i < 12

        return (
          <motion.div
            key={track.trackId}
            variants={useAnimation ? cardVariant : undefined}
            initial={useAnimation ? undefined : { opacity: 1 }}
            className="group relative"
          >
            <Link
              href={`/track/${track.trackId}`}
              className="block rounded-2xl p-5 transition-all duration-300
                         hover:translate-y-[-2px]"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}40`
                e.currentTarget.style.boxShadow = `0 4px 24px ${color}12, 0 0 0 1px ${color}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Emotion color glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                           transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 10% 50%, ${color}0A, transparent 70%)`,
                }}
              />

              {/* Emotion badge + relative time */}
              <div className="flex items-center justify-between mb-3 relative z-[1] pr-10">
                {track.emotion && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}`,
                      color,
                    }}
                  >
                    {track.emotionLabel ?? track.emotion}
                  </span>
                )}
                <span className="text-xs text-[var(--text-muted)]">
                  {formatRelativeTime(track.createdAt, t)}
                </span>
              </div>

              {/* Title */}
              <p className="font-display font-semibold text-base text-[var(--text-primary)] relative z-[1] pr-10">
                {track.title}
              </p>
            </Link>

            {/* Delete button: always visible on mobile, hover-reveal on desktop */}
            <div className="absolute top-4 right-4 z-[2] opacity-100 sm:opacity-0
                            sm:group-hover:opacity-100 transition-opacity duration-200">
              <DeleteTrackButton trackId={track.trackId} />
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
