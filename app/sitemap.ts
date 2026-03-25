import { MetadataRoute } from 'next'
import { getSitemapTrackIds } from '@/lib/kv'
import { decodeTime } from 'ulid'

// ISR: 1時間ごとに再生成
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // NEXT_PUBLIC_SITE_URL は本番で必須の設定。VERCEL_URL はプレビュー環境のURLのため
  // 本番サイトマップに入らないよう注意。本番デプロイ前に必ず NEXT_PUBLIC_SITE_URL を設定すること。
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://soultrack.io')

  const trackIds = await getSitemapTrackIds()

  // legal/privacy/terms は robots: { index: false } が設定済みのためサイトマップから除外
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  const trackPages: MetadataRoute.Sitemap = trackIds
    .map((trackId) => {
      try {
        return {
          url: `${siteUrl}/track/${trackId}`,
          lastModified: new Date(decodeTime(trackId)),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }
      } catch {
        // 不正な ULID がsorted setに混入した場合、サイトマップ全体が500にならないようスキップ
        console.error(`[sitemap] invalid ULID skipped: ${trackId}`)
        return null
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  return [...staticPages, ...trackPages]
}
