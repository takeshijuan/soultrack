'use client'

import { useState, useEffect, useRef } from 'react'

interface TrackPlayerProps {
  trackId: string
  initialStatus: 'processing' | 'done' | 'failed' | 'timeout'
  initialAudioUrl?: string
  title: string
  copy: string
}

// Deterministic waveform heights pattern (20 bars)
const WAVEFORM_HEIGHTS = [40, 65, 80, 55, 90, 70, 45, 85, 60, 95, 50, 75, 88, 42, 78, 62, 92, 48, 72, 58]

type Status = 'processing' | 'done' | 'failed' | 'timeout'

export default function TrackPlayer({
  trackId,
  initialStatus,
  initialAudioUrl,
  title,
  copy,
}: TrackPlayerProps) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const pollCountRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
        const res = await fetch(`/api/status/${trackId}`)
        if (!res.ok) return
        const data = await res.json() as { status: string; audioUrl?: string }

        if (data.status === 'done') {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setAudioUrl(data.audioUrl)
          setStatus('done')
        } else if (data.status === 'failed' || data.status === 'timeout') {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setStatus(data.status as 'failed' | 'timeout')
        }
      } catch {
        // silently ignore network errors and retry on next tick
      }
    }

    intervalRef.current = setInterval(poll, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [status, trackId])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  // Error/failed states
  if (status === 'failed') {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-center">
        <p className="text-zinc-400">Generation failed. Try again.</p>
      </div>
    )
  }

  if (status === 'timeout') {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-center">
        <p className="text-zinc-400">Generation timed out. Try again.</p>
      </div>
    )
  }

  // Loading / processing state
  if (status === 'processing') {
    return (
      <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 flex flex-col items-center gap-4">
        <p
          className="text-zinc-300 text-lg font-medium animate-pulse"
          style={{ animationDuration: '2s' }}
        >
          Composing your moment...
        </p>
        <div className="flex gap-1 items-end h-8">
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="w-1 bg-zinc-600 rounded-full animate-pulse"
              style={{
                height: `${h * 0.3}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  // Done state — show player
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 flex flex-col gap-5">
      {/* Title & copy */}
      <div>
        <h2 className="text-white text-xl font-bold leading-tight">{title}</h2>
        <p className="text-zinc-400 text-sm italic mt-1">{copy}</p>
      </div>

      {/* Waveform */}
      <div className="flex gap-1 items-end h-12">
        {WAVEFORM_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all ${isPlaying ? 'bg-white' : 'bg-zinc-600'}`}
            style={{
              height: `${(h / 100) * 48}px`,
              animation: isPlaying
                ? `waveform-pulse 1s ease-in-out ${i * 0.05}s infinite alternate`
                : 'none',
            }}
          />
        ))}
      </div>

      {/* Play/Pause button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-xl font-bold hover:bg-zinc-200 transition-colors"
          aria-label={isPlaying ? '一時停止' : '再生'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Waveform animation keyframes */}
      <style>{`
        @keyframes waveform-pulse {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  )
}
