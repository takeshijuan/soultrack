import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import authConfig from './auth.config'

// auth.config.ts (adapterなし) を使うことでEdgeランタイムで安全に動作する
const { auth } = NextAuth(authConfig)

const LOCALES = ['en', 'ja', 'ko', 'zh', 'zh-TW'] as const
type Locale = typeof LOCALES[number]

export function detectLocale(request: NextRequest): Locale {
  // 1. ?lang= query param
  const langParam = request.nextUrl.searchParams.get('lang')
  if (langParam && (LOCALES as readonly string[]).includes(langParam)) return langParam as Locale

  // 2. NEXT_LOCALE cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)) return cookieLocale as Locale

  // 3. Accept-Language header
  const acceptLang = request.headers.get('accept-language') ?? ''
  for (const raw of acceptLang.split(',')) {
    const tag = raw.split(';')[0].trim().toLowerCase()
    if (tag.startsWith('zh-tw') || tag.startsWith('zh-hant')) return 'zh-TW'
    if (tag.startsWith('zh')) return 'zh'
    if (tag.startsWith('ja')) return 'ja'
    if (tag.startsWith('ko')) return 'ko'
    if (tag.startsWith('en')) return 'en'
  }
  return 'en'
}

export const middleware = auth((request) => {
  const locale = detectLocale(request)
  const response = NextResponse.next()

  // Pass locale to i18n/request.ts via header
  response.headers.set('x-locale', locale)

  // Persist ?lang= choice as cookie
  const langParam = request.nextUrl.searchParams.get('lang')
  if (langParam && (LOCALES as readonly string[]).includes(langParam)) {
    response.cookies.set('NEXT_LOCALE', langParam, { maxAge: 365 * 24 * 60 * 60, path: '/' })
  }

  return response
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
