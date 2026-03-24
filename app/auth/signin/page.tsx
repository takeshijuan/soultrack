import { signIn, auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTranslations } from 'next-intl/server'
import SubmitButton from "@/app/auth/_components/SubmitButton"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const session = await auth()
  if (session?.user?.id) redirect("/my-tracks")

  const { redirect: redirectTo } = await searchParams
  const t = await getTranslations('auth')

  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00F5D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-2 text-center">{t('signInTitle')}</h1>
        <p className="text-[var(--text-muted)] text-sm text-center mb-8">
          {t('signInSubtitle')}
        </p>
        {redirectTo && (
          <p className="text-[var(--text-muted)] text-xs text-center mb-4 -mt-4">
            {t('redirectHint')}
          </p>
        )}
        <form
          action={async (formData: FormData) => {
            "use server"
            await signIn("resend", {
              email: formData.get("email") as string,
              redirectTo: redirectTo ?? "/my-tracks",
            })
          }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-4"
        >
          <label htmlFor="email" className="sr-only">{t('emailLabel')}</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
            suppressHydrationWarning
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00F5D4]/50 focus:ring-1 focus:ring-[#00F5D4]/30 text-sm transition-colors"
          />
          <SubmitButton />
        </form>
      </div>
    </main>
  )
}
