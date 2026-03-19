import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Soultrack — the music of your moment',
  description: '3 questions. One melody. Yours.',
  openGraph: {
    title: 'Soultrack — the music of your moment',
    description: '3 questions. One melody. Yours.',
    images: ['/api/og'],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@600,700&display=swap"
        />
      </head>
      <body className={`${dmSans.variable} font-sans bg-[#0A0A0F] min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
