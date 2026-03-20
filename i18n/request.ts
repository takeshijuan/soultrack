import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'

export default getRequestConfig(async () => {
  const headerStore = await headers()
  const locale = headerStore.get('x-locale') ?? 'en'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
