import { auth, signOut } from "@/auth"
import Link from "next/link"
import { getTranslations } from 'next-intl/server'

export default async function UserButton() {
  const session = await auth()
  const t = await getTranslations('navigation')

  if (session?.user) {
    return (
      <div className="flex items-center gap-1">
        {/* マイトラック: ライブラリアイコン */}
        <Link
          href="/my-tracks"
          aria-label={t('myTracks')}
          className="p-2 -m-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </Link>
        {/* ログアウト: 退出アイコン */}
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button
            aria-label={t('logout')}
            className="p-2 -m-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </form>
      </div>
    )
  }

  return (
    <Link
      href="/auth/signin"
      aria-label={t('login')}
      className="p-2 -m-1 text-[var(--text-muted)] hover:text-[var(--accent-teal)] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </Link>
  )
}
