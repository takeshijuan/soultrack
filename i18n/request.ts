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
  const messages =
    locale === 'en'
      ? enMessages
      : deepMerge(enMessages, (await import(`../messages/${locale}.json`)).default)

  return { locale, messages }
})
