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
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FF9A3C]/10 border border-[#FF9A3C]/20 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9A3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        </div>
        <h1 className="font-display text-xl font-bold text-white mb-2">{t('errorHeading')}</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          {t(bodyKey)}
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <p className="text-xs mb-4 font-mono px-3 py-1.5 rounded-lg bg-[#FF9A3C]/10 border border-[#FF9A3C]/20 text-[#FF9A3C]/70">error={error}</p>
        )}
        <Link
          href="/auth/signin"
          className="inline-block text-sm px-5 py-3 rounded-full bg-[#00F5D4] text-black font-display font-semibold hover:shadow-[0_0_20px_rgba(0,245,212,0.4)] hover:brightness-110 transition-all"
        >
          {t('errorRetry')}
        </Link>
      </div>
    </main>
  )
}
