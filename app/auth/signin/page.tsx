import { signIn, auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTranslations } from 'next-intl/server'

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
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Soultrack</h1>
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
          className="space-y-4"
        >
          <label htmlFor="email" className="sr-only">{t('emailLabel')}</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
            suppressHydrationWarning
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-sm"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
          >
            {t('submitButton')}
          </button>
        </form>
      </div>
    </main>
  )
}
