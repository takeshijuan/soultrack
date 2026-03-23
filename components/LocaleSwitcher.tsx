'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

const LOCALES = ['en', 'ja', 'ko', 'zh', 'zh-TW']

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('navigation')

  const handleChange = () => {
    const currentIndex = LOCALES.indexOf(locale)
    const nextLocale = LOCALES[(currentIndex + 1) % LOCALES.length]
    document.cookie = `NEXT_LOCALE=${nextLocale}; max-age=${365 * 24 * 60 * 60}; path=/`
    router.refresh()
  }

  return (
    <button
      onClick={handleChange}
      aria-label={`${t('switchLanguage')} (${locale.toUpperCase()})`}
      className="p-2 -m-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative"
    >
      {/* グローブアイコン */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </button>
  )
}
