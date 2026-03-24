'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

const LOCALES = ['en', 'ja', 'ko', 'zh', 'zh-TW'] as const

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('navigation')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Click-outside to close
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleSelect = useCallback((nextLocale: string) => {
    setOpen(false)
    document.cookie = `NEXT_LOCALE=${nextLocale}; max-age=${365 * 24 * 60 * 60}; path=/`
    router.refresh()
  }, [router])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('switchLanguage')}
        className="flex items-center gap-1 p-2 -m-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="text-xs font-medium">{locale.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t('switchLanguage')}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+8px)] right-0 min-w-[64px] rounded-xl bg-[#111118] border border-white/10 py-1 overflow-hidden"
          >
            {LOCALES.map((loc) => (
              <li
                key={loc}
                role="option"
                aria-selected={locale === loc}
                onClick={() => handleSelect(loc)}
                className={[
                  'px-4 min-h-[44px] flex items-center justify-center cursor-pointer',
                  'text-xs font-medium transition-colors',
                  locale === loc
                    ? 'text-[#00F5D4]'
                    : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                {loc.toUpperCase()}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
