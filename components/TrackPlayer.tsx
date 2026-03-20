'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ShareButtons from '@/components/ShareButtons'
import { EMOTION_LOADING_COPY } from '@/lib/emotions'

interface TrackPlayerProps {
  trackId: string
  initialStatus: 'processing' | 'done' | 'failed' | 'timeout'
  initialAudioUrl?: string
  title: string
  copy: string
  emotion?: string
}

const WAVEFORM_HEIGHTS = [
  40, 65, 80, 55, 90, 70, 45, 85, 60, 95, 50, 75, 88, 42, 78, 62, 92, 48, 72, 58,
  44, 68, 82, 58, 86, 74, 50, 80, 64, 90, 52, 70,
]

type Status = 'processing' | 'done' | 'failed' | 'timeout'

function CelebrationBurst() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [1, 0.8, 0],
            x: Math.cos((i * 36 * Math.PI) / 180) * 120,
            y: Math.sin((i * 36 * Math.PI) / 180) * 120,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            width: 12,
            height: 12,
            background: 'var(--accent-teal)',
            boxShadow: '0 0 12px var(--accent-teal)',
          }}
        />
      ))}
    </div>
  )
}

export default function TrackPlayer({
  trackId,
  initialStatus,
  initialAudioUrl,
  title,
  copy,
  emotion,
}: TrackPlayerProps) {
  const [status, setStatus]     = useState<Status>(initialStatus)
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const audioRef     = useRef<HTMLAudioElement>(null)
  const pollCountRef = useRef(0)
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status !== 'processing') return

    const poll = async () => {
      pollCountRef.current += 1
      if (pollCountRef.current > 30) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setStatus('timeout')
        return
      }
      try {
        const res  = await fetch(`/api/status/${trackId}`)
        if (!res.ok) return
        const data = await res.json() as { status: string; audioUrl?: string }
        if (data.status === 'done') {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setAudioUrl(data.audioUrl)
          setStatus('done')
          // Celebration burst: triggered from async callback (not sync effect body)
          setShowBurst(true)
          setTimeout(() => setShowBurst(false), 800)
        } else if (data.status === 'failed' || data.status === 'timeout') {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setStatus(data.status as 'failed' | 'timeout')
        }
      } catch { /* retry on next tick */ }
    }

    intervalRef.current = setInterval(poll, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [status, trackId])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { audio.play().catch(() => {}); setIsPlaying(true) }
  }

  // ── Error states ──
  if (status === 'failed' || status === 'timeout') {
    const msg = status === 'failed' ? 'Generation failed.' : 'Generation timed out.'
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <p className="text-[var(--text-muted)] mb-2">{msg}</p>
        <a href="/create" className="text-[var(--accent-teal)] text-sm hover:underline">Try again →</a>
      </div>
    )
  }

  const loadingText = (emotion && EMOTION_LOADING_COPY[emotion]) ?? 'Composing your moment...'

  // ── Processing state ──
  if (status === 'processing') {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <div className="text-center">
          <motion.p
            className="font-display font-bold text-2xl text-[var(--text-primary)] mb-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {loadingText}
          </motion.p>
          <p className="text-[var(--text-muted)] text-sm">This takes about 30–60 seconds</p>
        </div>

        {/* Animated waveform */}
        <div className="flex gap-[3px] items-end h-14">
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <motion.div
              key={i}
              className="w-[3px] rounded-full"
              style={{
                background: 'linear-gradient(to top, var(--accent-amber), var(--accent-teal))',
                originY: 1,
                height: `${(h / 100) * 56}px`,
              }}
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.4,
                delay: i * 0.05,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Done state ──
  return (
    <>
      <AnimatePresence>
        {showBurst && <CelebrationBurst />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="rounded-2xl p-6 flex flex-col gap-6"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        {/* Title & copy */}
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text-primary)] leading-tight mb-2">
            {title}
          </h2>
          <p className="text-[var(--text-muted)] text-sm italic leading-relaxed">{copy}</p>
        </div>

        {/* Waveform */}
        <div className="flex gap-[3px] items-end h-14">
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full transition-all duration-200"
              style={{
                height: `${(h / 100) * 56}px`,
                background: isPlaying
                  ? 'linear-gradient(to top, var(--accent-amber), var(--accent-teal))'
                  : 'var(--border-hover)',
                transformOrigin: 'bottom',
                animation: isPlaying
                  ? `waveform-pulse 1s ease-in-out ${i * 0.04}s infinite alternate`
                  : 'none',
              }}
            />
          ))}
        </div>

        {/* Play button */}
        <div className="flex justify-center">
          <motion.button
            type="button"
            onClick={togglePlay}
            whileTap={{ scale: 0.93 }}
            className="w-16 h-16 rounded-full flex items-center justify-center text-black font-bold text-xl"
            style={{
              background: 'var(--accent-teal)',
              boxShadow: isPlaying
                ? '0 0 40px rgba(0,245,212,0.5), 0 0 80px rgba(0,245,212,0.2)'
                : '0 0 20px rgba(0,245,212,0.25)',
            }}
            animate={isPlaying ? {
              boxShadow: [
                '0 0 20px rgba(0,245,212,0.3)',
                '0 0 50px rgba(0,245,212,0.6)',
                '0 0 20px rgba(0,245,212,0.3)',
              ],
            } : {}}
            transition={isPlaying ? { duration: 1.5, repeat: Infinity } : {}}
            aria-label={isPlaying ? '一時停止' : '再生'}
          >
            {isPlaying
              ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              : <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 translate-x-0.5" aria-hidden="true">
                  <path d="M8 5v14l11-7z"/>
                </svg>
            }
          </motion.button>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        <ShareButtons trackId={trackId} title={title} />
      </motion.div>
    </>
  )
}
