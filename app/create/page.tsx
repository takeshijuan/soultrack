import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import CreateForm from '@/components/CreateForm'

export default async function CreatePage() {
  const t = await getTranslations('create')
  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)]">
      <div className="ambient-content max-w-xl mx-auto px-5 py-10">

        {/* Nav */}
        <div className="mb-10">
          <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors">
            {t('back')}
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--text-primary)] leading-tight mb-2">
            {t('header')}
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            {t('subtext')}
          </p>
        </div>

        <CreateForm />
      </div>
    </main>
  )
}
