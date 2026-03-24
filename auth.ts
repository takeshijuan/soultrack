import NextAuth from "next-auth"
import ResendProvider from "next-auth/providers/resend"
import { render } from "@react-email/components"
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter"
import { kv } from "@vercel/kv"
import authConfig from "./auth.config"
import { MagicLinkEmail } from "@/emails/MagicLinkEmail"
import React from "react"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: UpstashRedisAdapter(kv),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
  ...authConfig,
  // providers を後に宣言して authConfig.providers を上書き
  // ResendProvider() の返り値をスプレッドして sendVerificationRequest だけ差し替える
  // → id, type, name, from, maxAge, options フィールドを正しく継承する安全なパターン
  // （auth.config.ts はEdgeランタイム互換を維持するため変更しない）
  providers: [
    {
      ...ResendProvider({ from: "Soultrack <noreply@soultrack.io>" }),
      sendVerificationRequest: async ({ identifier, url }) => {
        // AUTH_RESEND_KEY が正しい環境変数名（next-auth v5 の命名規則）
        const apiKey = process.env.AUTH_RESEND_KEY
        if (!apiKey) throw new Error("AUTH_RESEND_KEY is not set")

        // セキュリティ: https:// のみ許可（javascript: scheme 等をブロック）
        if (!url.startsWith("https://")) throw new Error("Invalid magic link URL scheme")

        const html = await render(React.createElement(MagicLinkEmail, { url }))
        // render() 2回呼び出しを避けるためプレーンテキストはハードコード
        const text = `Sign in to Soultrack:\n\n${url}\n\nThis link expires in 24 hours.\n\nIf you did not request this email, you can safely ignore it.`

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Soultrack <noreply@soultrack.io>",
            to: identifier,
            subject: "Sign in to Soultrack",
            html,
            text,
          }),
        })

        if (!response.ok) {
          let errorBody: string
          try {
            const json = await response.json()
            errorBody = JSON.stringify(json)
          } catch {
            errorBody = await response.text()
          }
          console.error(`[auth] Resend API error: ${response.status}`, errorBody)
          throw new Error(`Resend API error: ${response.status}`)
        }
      },
    },
  ],
})
