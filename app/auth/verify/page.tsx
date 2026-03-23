import Link from "next/link"
import { getTranslations } from 'next-intl/server'

export default async function VerifyPage() {
  const t = await getTranslations('auth')

  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">✉️</div>
        <h1 className="text-xl font-bold text-white mb-2">{t('verifyHeading')}</h1>
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
