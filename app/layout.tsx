import { DM_Sans } from 'next/font/google'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { Analytics } from '@vercel/analytics/react'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import Footer from '@/components/Footer'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export async function generateMetadata() {
  const t = await getTranslations('metadata')
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: ['/api/og'],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const messages = await getMessages()
  // Legal pages are server-only — exclude from client bundle to avoid payload inflation (~8KB/request)
  const { legal: _legal, ...clientMessages } = messages as Record<string, unknown>

  return (
    <html lang={locale}>
      <body className={`${dmSans.variable} font-sans bg-[#0A0A0F] min-h-screen`}>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <div className="fixed top-4 right-4 z-50">
            <LocaleSwitcher />
          </div>
          {children}
          <Footer />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
