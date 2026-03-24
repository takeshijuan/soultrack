import { render } from "@react-email/components"
import { describe, it, expect } from "vitest"
import { MagicLinkEmail } from "./MagicLinkEmail"
import React from "react"

describe("MagicLinkEmail", () => {
  const url =
    "https://soultrack.io/api/auth/callback/resend?token=abc&email=user%40example.com"
  // HTMLレンダリング時に & は &amp; にエスケープされる
  const escapedUrl = url.replace(/&/g, "&amp;")

  it("ページタイトルとCTAリンクを含む", async () => {
    const html = await render(<MagicLinkEmail url={url} />)
    expect(html).toContain("Sign in to Soultrack")
    expect(html).toContain(escapedUrl)
  })

  it("プレーンテキスト版にURLを含む", async () => {
    const text = await render(<MagicLinkEmail url={url} />, { plainText: true })
    expect(text).toContain(url)
    expect(text).toContain("Sign in to Soultrack")
  })

  it("ブランドカラー teal を含む", async () => {
    const html = await render(<MagicLinkEmail url={url} />)
    expect(html).toContain("#00F5D4")
  })

  it("CTAボタンに正しいhrefが設定されている", async () => {
    const html = await render(<MagicLinkEmail url={url} />)
    expect(html).toContain(`href="${escapedUrl}"`)
  })
})
