"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  trackId: string
  isAuthenticated: boolean
  initialSaved?: boolean
}

export default function SaveToLibraryButton({ trackId, isAuthenticated, initialSaved = false }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/signin?redirect=/track/${trackId}`)
      return
    }
    setSaving(true)
    setError(false)
    try {
      const res = await fetch(`/api/save-track/${trackId}`, { method: "POST" })
      if (res.ok) setSaved(true)
      else setError(true)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <span className="text-sm text-[#00F5D4] font-medium">✓ ライブラリに保存済み</span>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-sm px-5 py-3 rounded-full bg-[#00F5D4] text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "保存中..." : "この曲を手元に残す"}
      </button>
      {error && <span className="text-xs text-red-400">保存できませんでした。もう一度お試しください。</span>}
    </div>
  )
}
