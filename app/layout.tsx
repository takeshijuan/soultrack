import { DM_Sans } from 'next/font/google'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { Analytics } from '@vercel/analytics/react'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import UserButton from '@/components/UserButton'
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

  return (
    <html lang={locale}>
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@600,700&display=swap"
        />
      </head>
      <body className={`${dmSans.variable} font-sans bg-[#0A0A0F] min-h-screen`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
            <UserButton />
            <LocaleSwitcher />
          </div>
          {children}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
