import Link from "next/link"
import { getTranslations } from 'next-intl/server'

export default async function AuthErrorPage() {
  const t = await getTranslations('auth')

  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold text-white mb-2">{t('errorHeading')}</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          {t('errorBody')}
        </p>
        <Link
          href="/auth/signin"
          className="text-sm px-5 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
        >
          {t('errorRetry')}
        </Link>
      </div>
    </main>
  )
}
