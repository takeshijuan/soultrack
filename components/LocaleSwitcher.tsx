'use client'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

const LOCALES = [
  { code: 'en',    label: 'EN' },
  { code: 'ja',    label: 'JA' },
  { code: 'ko',    label: 'KO' },
  { code: 'zh',    label: 'ZH' },
  { code: 'zh-TW', label: 'TW' },
]

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()

  const handleChange = (code: string) => {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${code}; max-age=${365 * 24 * 60 * 60}; path=/`
    router.refresh()
  }

  return (
    <div className="flex gap-1">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          className={`text-[10px] px-1.5 py-0.5 rounded tracking-wider transition-colors duration-150 ${
            code === locale
              ? 'text-[var(--accent-teal)] border border-[var(--accent-teal)]'
              : 'text-[var(--text-muted)] border border-transparent hover:text-[var(--text-primary)]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
