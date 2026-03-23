import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function Footer() {
  const t = await getTranslations('legal.footer')
  return (
    <footer className="w-full border-t border-white/5 py-6 px-6 flex justify-center gap-8 text-xs text-[var(--text-muted)]">
      <Link href="/privacy" className="hover:text-white/70 transition-colors">
        {t('privacy')}
      </Link>
      <Link href="/terms" className="hover:text-white/70 transition-colors">
        {t('terms')}
      </Link>
      <span>© {new Date().getFullYear()} Soultrack</span>
    </footer>
  )
}
