import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  return {
    title: 'Legal — Soultrack',
    robots: { index: false, follow: false },
  }
}

export default async function LegalPage() {
  const t = await getTranslations('legal.footer')
  return (
    <main className="max-w-2xl mx-auto px-6 py-24 text-white">
      <Link
        href="/"
        className="text-[var(--text-muted)] text-sm mb-10 block hover:text-white/70 transition-colors"
      >
        ← Soultrack
      </Link>
      <h1 className="font-display text-4xl mb-12">Legal</h1>
      <div className="space-y-4">
        <Link
          href="/privacy"
          className="flex items-center p-4 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
        >
          <span className="text-white/90">{t('privacy')}</span>
        </Link>
        <Link
          href="/terms"
          className="flex items-center p-4 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
        >
          <span className="text-white/90">{t('terms')}</span>
        </Link>
      </div>
    </main>
  )
}
