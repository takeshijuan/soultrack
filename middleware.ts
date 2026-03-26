import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import authConfig from './auth.config'
import { resolveLocale, VALID_LOCALES, type Locale } from '@/lib/locale'

// auth.config.ts (adapterなし) を使うことでEdgeランタイムで安全に動作する
const { auth } = NextAuth(authConfig)

export function detectLocale(request: NextRequest): Locale {
  // ?lang= query param takes highest priority (middleware-only, not available in API routes)
  const langParam = request.nextUrl.searchParams.get('lang')
  if (langParam && (VALID_LOCALES as readonly string[]).includes(langParam)) return langParam as Locale

  // Delegate to shared resolver for cookie + Accept-Language
  return resolveLocale(
    request.cookies.get('NEXT_LOCALE')?.value,
    request.headers.get('accept-language') ?? undefined,
  )
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
