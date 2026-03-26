import { DM_Sans } from 'next/font/google'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { Analytics } from '@vercel/analytics/react'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import UserButton from '@/components/UserButton'
import Link from 'next/link'
import { SoultrackIcon } from '@/components/SoultrackLogo'
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
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://soultrack.io')
    ),
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: '/',
      siteName: 'Soultrack',
      type: 'website',
      images: [{
        url: '/api/og',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: t('title'),
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [{
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: t('title'),
      }],
    },
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale()
  const messages = await getMessages()
  const t = await getTranslations('navigation')
  // Legal pages are server-only — exclude from client bundle to avoid payload inflation (~8KB/request)
  const { legal: _legal, ...clientMessages } = messages as Record<string, unknown>

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@600,700&display=swap"
        />
      </head>
      <body className={`${dmSans.variable} font-sans bg-[#0A0A0F] min-h-screen`}>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          {/* ブランドアイコン: 左上固定、感情反応カラー、ambient と同じ 800ms transition */}
          <div className="fixed top-4 left-4 z-50">
            <Link
              href="/"
              aria-label={t('homeLabel')}
              className="flex items-center justify-center p-2 -m-2"
              style={{
                color: 'var(--emotion-hue, #00F5D4)',
                transition: 'color 800ms ease',
              }}
            >
              <SoultrackIcon size={24} />
            </Link>
          </div>
          <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
            <UserButton />
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
