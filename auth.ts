import NextAuth from "next-auth"
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter"
import { kv } from "@vercel/kv"
import authConfig from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  // UpstashRedisAdapter uses @vercel/kv (Upstash Redis compatible client)
  // strategy: "jwt" — JWTクッキーでセッション管理（Edge互換）
  // strategy: "database" はEdge/middlewareでクラッシュする可能性があるため使用しない
  adapter: UpstashRedisAdapter(kv),
  session: { strategy: "jwt" },
  ...authConfig,
})
