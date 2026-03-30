"use client"

import { useState, useRef } from "react"
import { useTranslations } from 'next-intl'

const KV_UNDO_MS = 3000

export default function DeleteTrackButton({ trackId }: { trackId: string }) {
  const [state, setState] = useState<'idle' | 'deleting' | 'deleted' | 'undoVisible' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = useTranslations('library')

  if (state === 'deleted') return null

  return (
    <div className="inline-flex items-center gap-1">
      {(state === 'idle' || state === 'deleting' || state === 'error') && (
        <button
          disabled={state === 'deleting'}
          onClick={async () => {
            setState('deleting')
            const res = await fetch(`/api/save-track/${trackId}`, { method: "DELETE" })
            if (!res.ok) { setState('error'); return }
            setState('undoVisible')
            timerRef.current = setTimeout(() => setState('deleted'), KV_UNDO_MS)
          }}
          className="w-8 h-8 min-h-[44px] min-w-[44px] -m-2 p-2 rounded-full text-[var(--text-muted)] hover:text-red-400 hover:bg-white/10 transition-all text-xs flex items-center justify-center disabled:opacity-40"
          aria-label={t('deleteLabel')}
        >
          ✕
        </button>
      )}
      {state === 'undoVisible' && (
        <button
          onClick={async () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            await fetch(`/api/save-track/${trackId}`, { method: "POST" })
            setState('idle')
          }}
          className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 transition-colors whitespace-nowrap"
        >
          {t('undoDelete')}
        </button>
      )}
      {state === 'error' && (
        <span className="text-xs text-red-400">{t('deleteError')}</span>
      )}
    </div>
  )
}
