import Link from "next/link"
import { getTranslations } from 'next-intl/server'

export default async function VerifyPage() {
  const t = await getTranslations('auth')

  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center"
            style={{ animation: "float 3s ease-in-out infinite" }}
            aria-hidden="true"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00F5D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
        </div>
        <h1 className="font-display text-xl font-bold text-white mb-2">{t('verifyHeading')}</h1>
        <p className="text-[var(--text-muted)] text-sm">
          {t('verifyBody1')}<br />
          {t('verifyBody2')}
        </p>
        <p className="text-[var(--text-muted)] text-xs mt-4">
          {t('verifySpam')}
        </p>
        <Link
          href="/auth/signin"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mt-4 inline-block transition-colors"
        >
          {t('verifyChangeEmail')}
        </Link>
      </div>
    </main>
  )
}
