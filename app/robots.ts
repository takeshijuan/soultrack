import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    // NEXT_PUBLIC_SITE_URL は本番で必須の設定。VERCEL_URL はプレビュー環境のURLのため
  // 本番サイトマップに入らないよう注意。本番デプロイ前に必ず NEXT_PUBLIC_SITE_URL を設定すること。
  const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.soultrack.io')
    return {
          rules: [
            {
                      userAgent: '*',
                      allow: ['/', '/api/og'],
                      disallow: [
                                  '/auth/',
                                  '/api/',
                                  '/my-tracks',
                                  '/my-tracks/',
                                  '/$',
                                  '/&',
                                ],
            },
                ],
          sitemap: `${siteUrl}/sitemap.xml`,
    }
}
