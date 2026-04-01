'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import ShareButtons from '@/components/ShareButtons'
import { EMOTION_LOADING_COPY } from '@/lib/emotions'
import { trackEvent, EVENTS } from '@/lib/analytics'

interface TrackPlayerProps {
  trackId: string
  initialStatus: 'processing' | 'done' | 'failed' | 'timeout'
  initialAudioUrl?: string
  title: string
  copy: string
  emotion?: string
  trackSize?: 'short' | 'long'
}

const WAVEFORM_HEIGHTS = [
  40, 65, 80, 55, 90, 70, 45, 85, 60, 95, 50, 75, 88, 42, 78, 62, 92, 48, 72, 58,
  44, 68, 82, 58, 86, 74, 50, 80, 64, 90, 52, 70,
]

type Status = 'processing' | 'done' | 'failed' | 'timeout'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

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
            background: 'var(--emotion-hue)',
            boxShadow: '0 0 12px var(--emotion-hue)',
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
  trackSize: initialTrackSize,
}: TrackPlayerProps) {
  const t = useTranslations('player')
  const shouldReduceMotion = useReducedMotion()
  const [status, setStatus]     = useState<Status>(initialStatus)
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [trackSize, setTrackSize] = useState<'short' | 'long' | undefined>(initialTrackSize)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef      = useRef<HTMLAudioElement>(null)
  const pollCountRef  = useRef(0)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedSecRef = useRef(0)

  const isCompact = trackSize === 'short'
  const progress = duration > 0 ? currentTime / duration : 0

  // Elapsed timer for multi-phase loading text
  useEffect(() => {
    if (status !== 'processing') return
    timerRef.current = setInterval(() => {
      elapsedSecRef.current += 1
      setElapsedSec(s => s + 1)
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [status])

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
        const data = await res.json() as { status: string; audioUrl?: string; trackSize?: string }
        if (data.status === 'done') {
          if (intervalRef.current) clearInterval(intervalRef.current)
          if (timerRef.current) clearInterval(timerRef.current)
          setAudioUrl(data.audioUrl)
          setStatus('done')
          if (data.trackSize) setTrackSize(data.trackSize as 'short' | 'long')
          trackEvent(EVENTS.GENERATION_COMPLETE, { trackId, elapsed: elapsedSecRef.current })
          setShowBurst(true)
          setTimeout(() => setShowBurst(false), 800)
          // Detect fallback (requested 120s but got a shorter Replicate track)
          if (data.trackSize === 'long') {
            if (elapsedSecRef.current < 20) {
              setIsFallback(true)
            }
          }
        } else if (data.status === 'failed' || data.status === 'timeout') {
          if (intervalRef.current) clearInterval(intervalRef.current)
          if (timerRef.current) clearInterval(timerRef.current)
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
    else {
      audio.play().catch(() => {})
      setIsPlaying(true)
      trackEvent(EVENTS.TRACK_PLAY, { trackId })
    }
  }

  const [isSeeking, setIsSeeking] = useState(false)

  const seekToFraction = (clientX: number, rect: DOMRect) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    audio.currentTime = fraction * duration
    setCurrentTime(fraction * duration)
  }

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    seekToFraction(e.clientX, e.currentTarget.getBoundingClientRect())
  }

  const handleBarTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    seekToFraction(e.changedTouches[0].clientX, e.currentTarget.getBoundingClientRect())
  }

  // Drag-to-seek for progress bar
  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsSeeking(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    seekToFraction(clientX, rect)

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const cx = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX
      seekToFraction(cx, rect)
    }
    const onEnd = () => {
      setIsSeeking(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd)
  }

  // ── Error states ──
  if (status === 'failed' || status === 'timeout') {
    const msg = status === 'failed' ? t('generationFailed') : t('generationTimeout')
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <p className="text-[var(--text-muted)] mb-2">{msg}</p>
        <a href="/create" className="text-[var(--accent-teal)] text-sm hover:underline">{t('tryAgain')}</a>
      </div>
    )
  }

  const emotionLoadingText = (emotion && EMOTION_LOADING_COPY[emotion]) ?? null
  const phaseText = elapsedSec < 10
    ? (emotionLoadingText ?? t('loadingPhase1'))
    : elapsedSec < 30
      ? t('loadingPhase2')
      : elapsedSec < 60
        ? t('loadingPhase3')
        : elapsedSec < 90
          ? t('loadingPhase4')
          : t('loadingPhase5')

  // ── Processing state ──
  if (status === 'processing') {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <div className="text-center">
          <motion.p
            key={phaseText}
            className="font-display font-bold text-2xl text-[var(--text-primary)] mb-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0.5, 1, 0.5], y: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {phaseText}
          </motion.p>
          <p className="text-[var(--text-muted)] text-sm">{t('generatingStatus')}</p>
        </div>

        {/* Animated waveform */}
        <div className="flex gap-[3px] items-end h-14 w-full">
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 min-w-0 rounded-full"
              style={{
                background: 'var(--emotion-hue)',
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
        className={`rounded-2xl ${isCompact ? 'p-5' : 'p-6'} flex flex-col ${isCompact ? 'gap-4' : 'gap-6'}`}
        style={{
          background: 'var(--surface-1)',
          border: `1px solid ${isPlaying ? 'color-mix(in srgb, var(--emotion-hue) 20%, transparent)' : 'var(--border)'}`,
          animation: isPlaying && !shouldReduceMotion ? 'card-glow 2.5s ease-in-out infinite' : 'none',
          transition: 'border-color 0.5s ease',
        }}
      >
        {/* Title & copy */}
        <div>
          <h2 className={`font-display font-bold ${isCompact ? 'text-xl' : 'text-2xl sm:text-3xl'} text-[var(--text-primary)] leading-tight mb-2`}>
            {title}
          </h2>
          {!isCompact && (
            <p className="text-[var(--text-muted)] text-sm italic leading-relaxed">{copy}</p>
          )}
        </div>

        {/* Waveform (full-width) */}
        <div
          className={`flex gap-[3px] items-end ${isCompact ? 'h-10 min-h-[44px]' : 'h-14'} w-full cursor-pointer select-none`}
          onClick={handleBarClick}
          onTouchEnd={handleBarTouchEnd}
        >
          {WAVEFORM_HEIGHTS.map((h, i) => {
            const barProgress = (i + 1) / WAVEFORM_HEIGHTS.length
            const isPlayed = barProgress <= progress
            const maxHeight = isCompact ? 40 : 56

            return (
              <div
                key={i}
                className="flex-1 min-w-0 rounded-full transition-all duration-200"
                style={{
                  height: `${(h / 100) * maxHeight}px`,
                  background: isPlaying
                    ? isPlayed
                      ? 'var(--emotion-hue)'
                      : 'color-mix(in srgb, var(--emotion-hue) 30%, transparent)'
                    : isPlayed && currentTime > 0
                      ? 'color-mix(in srgb, var(--emotion-hue) 50%, transparent)'
                      : 'var(--border-hover)',
                  transformOrigin: 'bottom',
                  animation: isPlaying && isPlayed && !shouldReduceMotion
                    ? `waveform-pulse 1s ease-in-out ${i * 0.04}s infinite alternate`
                    : 'none',
                }}
              />
            )
          })}
        </div>

        {/* Progress bar (draggable seek) */}
        <div
          className="relative w-full select-none touch-none"
          style={{ height: 20, cursor: 'pointer' }}
          role="progressbar"
          aria-label={t('seekTo', { time: formatTime(currentTime) })}
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
          aria-valuenow={Math.floor(currentTime)}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
        >
          {/* Track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-full rounded-full"
            style={{ height: 4, background: 'var(--border-hover)' }}
          />
          {/* Filled */}
          <div
            className="absolute top-1/2 -translate-y-1/2 rounded-full transition-[width] duration-100"
            style={{
              height: 4,
              width: `${progress * 100}%`,
              background: 'var(--emotion-hue)',
            }}
          />
          {/* Thumb */}
          {(duration > 0) && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-[left] duration-100"
              style={{
                width: isSeeking ? 16 : 12,
                height: isSeeking ? 16 : 12,
                left: `${progress * 100}%`,
                background: 'var(--emotion-hue)',
                boxShadow: '0 0 8px color-mix(in srgb, var(--emotion-hue) 40%, transparent)',
              }}
            />
          )}
        </div>

        {/* Time display */}
        {duration > 0 && (
          <div className="flex justify-between text-xs font-sans font-medium text-[var(--text-muted)] tabular-nums">
            <span>{formatTime(currentTime)}</span>
            {!isCompact && <span>-{formatTime(duration - currentTime)}</span>}
          </div>
        )}

        {/* Play button */}
        <div className="flex justify-center">
          <motion.button
            type="button"
            onClick={togglePlay}
            whileTap={{ scale: 0.93 }}
            className={`${isCompact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full flex items-center justify-center text-black font-bold text-xl`}
            style={{
              background: 'var(--emotion-hue)',
              boxShadow: '0 0 20px color-mix(in srgb, var(--emotion-hue) 25%, transparent)',
              animation: isPlaying && !shouldReduceMotion ? 'play-glow 1.5s ease-in-out infinite' : 'none',
            }}
            aria-label={isPlaying ? t('pause') : t('play')}
          >
            {isPlaying
              ? <svg viewBox="0 0 24 24" fill="currentColor" className={isCompact ? 'w-5 h-5' : 'w-6 h-6'} aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              : <svg viewBox="0 0 24 24" fill="currentColor" className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} translate-x-0.5`} aria-hidden="true">
                  <path d="M8 5v14l11-7z"/>
                </svg>
            }
          </motion.button>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => { setIsPlaying(false); setCurrentTime(0) }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              const t = audioRef.current.currentTime
              setCurrentTime(prev => Math.abs(t - prev) > 0.25 ? t : prev)
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && isFinite(audioRef.current.duration)) {
              setDuration(audioRef.current.duration)
            }
          }}
          className="hidden"
        />

        {isFallback && (
          <div
            className="rounded-xl p-4 text-center text-sm"
            style={{ background: 'rgba(255,154,60,0.08)', border: '1px solid rgba(255,154,60,0.3)' }}
          >
            <p className="text-[var(--accent-amber)] mb-2">{t('fallbackNotice')}</p>
            <a
              href="/create"
              className="text-[var(--accent-teal)] hover:underline text-xs"
            >
              {t('retryFullTrack')}
            </a>
          </div>
        )}

        <ShareButtons trackId={trackId} title={title} emotion={emotion} />
      </motion.div>
    </>
  )
}
