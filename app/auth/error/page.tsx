import Link from "next/link"
import { getTranslations } from 'next-intl/server'

// Auth.js error codes that map to user-friendly messages
const ERROR_BODY_MAP: Record<string, string> = {
  Verification:    'auth.errorBodyVerification',   // expired / already-used link
  Configuration:   'auth.errorBodyConfiguration',  // server-side config error
  AccessDenied:    'auth.errorBodyAccessDenied',
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const t = await getTranslations('auth')

  const bodyKey = error && ERROR_BODY_MAP[error]
    ? ERROR_BODY_MAP[error]
    : 'errorBody'

  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold text-white mb-2">{t('errorHeading')}</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          {t(bodyKey)}
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <p className="text-xs text-white/30 mb-4 font-mono">error={error}</p>
        )}
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
