export const VALID_LOCALES = ['en', 'ja', 'ko', 'zh', 'zh-TW'] as const
export type Locale = typeof VALID_LOCALES[number]

const LOCALE_SET = new Set<string>(VALID_LOCALES)

/**
 * Resolve locale from cookie value + Accept-Language header.
 * Shared between middleware.ts and API routes to prevent drift.
 * Middleware adds ?lang= on top of this; API routes use this directly.
 */
export function resolveLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | undefined,
): Locale {
  // 1. Cookie
  if (cookieValue && LOCALE_SET.has(cookieValue)) return cookieValue as Locale

  // 2. Accept-Language
  if (acceptLanguage) {
    for (const raw of acceptLanguage.split(',')) {
      const tag = raw.split(';')[0].trim().toLowerCase()
      if (tag.startsWith('zh-tw') || tag.startsWith('zh-hant')) return 'zh-TW'
      if (tag.startsWith('zh')) return 'zh'
      if (tag.startsWith('ja')) return 'ja'
      if (tag.startsWith('ko')) return 'ko'
      if (tag.startsWith('en')) return 'en'
    }
  }

  return 'en'
}
