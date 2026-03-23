import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import LegalSection from '@/components/LegalSection'

export async function generateMetadata() {
  const t = await getTranslations('legal.terms')
  return {
    title: `${t('title')} — Soultrack`,
    description: 'Terms and conditions for using Soultrack.',
    robots: { index: false, follow: false },
  }
}

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'contact@soultrack.io'

export default async function TermsPage() {
  const t = await getTranslations('legal.terms')
  return (
    <main className="max-w-2xl mx-auto px-6 py-24 text-white">
      <Link
        href="/"
        className="text-[var(--text-muted)] text-sm mb-10 block hover:text-white/70 transition-colors"
      >
        ← Soultrack
      </Link>
      <h1 className="font-display text-4xl mb-3">{t('title')}</h1>
      <p className="text-[var(--text-muted)] text-xs mb-12 tracking-wide">{t('lastUpdated')}</p>
      <p className="text-white/70 leading-relaxed mb-12 text-sm">{t('intro')}</p>
      <LegalSection title={t('serviceTitle')} body={t('serviceBody')} />
      <LegalSection title={t('usageTitle')} body={t('usageBody')} />
      <LegalSection title={t('contentTitle')} body={t('contentBody')} />
      <LegalSection title={t('limitationsTitle')} body={t('limitationsBody')} />
      <LegalSection title={t('disclaimerTitle')} body={t('disclaimerBody')} />
      <LegalSection title={t('changesTitle')} body={t('changesBody')} />
      <LegalSection title={t('governingLawTitle')} body={t('governingLawBody')} />
      <LegalSection title={t('contactTitle')} body={t('contactBody', { contactEmail: CONTACT_EMAIL })} />
    </main>
  )
}
