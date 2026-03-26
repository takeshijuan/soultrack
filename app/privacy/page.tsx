import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import LegalSection from '@/components/LegalSection'

export async function generateMetadata() {
  const t = await getTranslations('legal.privacy')
  return {
    title: `${t('title')} — Soultrack`,
    description: 'How Soultrack handles your data and privacy.',
  }
}

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'contact@soultrack.io'

export default async function PrivacyPage() {
  const t = await getTranslations('legal.privacy')
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
      <LegalSection title={t('dataCollectionTitle')} body={t('dataCollectionBody')} />
      <LegalSection title={t('dataUseTitle')} body={t('dataUseBody')} />
      <LegalSection title={t('thirdPartiesTitle')} body={t('thirdPartiesBody')} />
      <LegalSection title={t('retentionTitle')} body={t('retentionBody')} />
      <LegalSection title={t('userRightsTitle')} body={t('userRightsBody')} />
      <LegalSection title={t('contactTitle')} body={t('contactBody', { contactEmail: CONTACT_EMAIL })} />
    </main>
  )
}
