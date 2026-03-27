/**
 * 本番 KV からユーザー一覧を取得
 *
 * 実行: npx tsx scripts/list-users.ts
 *   （.env.production から自動読み込み、または環境変数を直接指定）
 *   KV_REST_API_URL=... KV_REST_API_TOKEN=... npx tsx scripts/list-users.ts
 */
import { config } from 'dotenv'
import { createClient } from '@vercel/kv'

config({ path: '.env.production' })

interface AuthUser {
  id: string
  name?: string
  email?: string
  emailVerified?: string
  image?: string
}

async function main() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    console.error('KV_REST_API_URL and KV_REST_API_TOKEN are required')
    console.error('Run: vercel env pull .env.production --environment=production')
    process.exit(1)
  }

  const kv = createClient({ url, token })

  const users: AuthUser[] = []

  // Next-Auth UpstashRedisAdapter のキー形式: "user:{uuid}"
  // 除外: "user:email:{email}", "user:{uuid}:tracks"
  for await (const key of kv.scanIterator({ match: 'user:*', count: 100 })) {
    const keyStr = key as string

    if (keyStr.includes(':email:') || keyStr.includes(':tracks')) continue

    const parts = keyStr.split(':')
    if (parts.length !== 2) continue

    const user = await kv.get<AuthUser>(keyStr)
    if (user) {
      users.push({ ...user, id: parts[1] })
    }
  }

  console.log(`\n=== Soultrack Users (${users.length}) ===\n`)
  for (const u of users) {
    const tracks = await kv.llen(`user:${u.id}:tracks`)
    console.log(`  ${u.email ?? '(no email)'} | id: ${u.id} | tracks: ${tracks}`)
  }
  console.log()
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
