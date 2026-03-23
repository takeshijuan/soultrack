import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(base: any, override: any): any {
  const result = { ...base }
  for (const key of Object.keys(override)) {
    if (
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      typeof base[key] === 'object'
    ) {
      result[key] = deepMerge(base[key], override[key])
    } else {
      result[key] = override[key]
    }
  }
  return result
}

export default getRequestConfig(async () => {
  const headerStore = await headers()
  const locale = headerStore.get('x-locale') ?? 'en'

  const enMessages = (await import('../messages/en.json')).default
  const enLegal = (await import('../messages/legal-en.json')).default
  const baseMessages = deepMerge(enMessages, enLegal)

  if (locale === 'en') {
    return { locale, messages: baseMessages }
  }

  let messages = deepMerge(baseMessages, (await import(`../messages/${locale}.json`)).default)

  // Only ja has a dedicated legal translation; ko/zh-TW/zh fall back to English legal text.
  // This is intentional — automated translation quality for legal documents is limited.
  if (locale === 'ja') {
    const jaLegal = (await import('../messages/legal-ja.json')).default
    messages = deepMerge(messages, jaLegal)
  }

  return { locale, messages }
})
