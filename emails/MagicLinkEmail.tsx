import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Link,
  Hr,
  Preview,
  Font,
} from "@react-email/components"
import React from "react"

interface MagicLinkEmailProps {
  url: string
}

export function MagicLinkEmail({ url }: MagicLinkEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="DM Sans"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZSIWt5t.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Preview>Your Soultrack sign-in link is ready</Preview>
      <Body
        style={{
          backgroundColor: "#0A0A0F",
          fontFamily: "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            paddingTop: "48px",
            paddingBottom: "48px",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          {/* ロゴ */}
          <Section style={{ textAlign: "center", marginBottom: "28px" }}>
            <Text
              style={{
                color: "#00F5D4",
                fontSize: "18px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Soultrack
            </Text>
          </Section>

          {/* メインカード */}
          <Section
            style={{
              backgroundColor: "#111118",
              borderRadius: "16px",
              border: "1px solid #1E1E28",
              padding: "40px",
            }}
          >
            {/* Teal アクセントライン */}
            <Section
              style={{
                height: "2px",
                backgroundColor: "#00F5D4",
                borderRadius: "2px",
                marginBottom: "32px",
              }}
            />

            <Heading
              style={{
                color: "#F0F0F8",
                fontSize: "24px",
                fontWeight: "700",
                textAlign: "center",
                margin: "0 0 12px 0",
                lineHeight: "1.3",
              }}
            >
              Sign in to Soultrack
            </Heading>

            <Text
              style={{
                color: "#8080A0",
                fontSize: "15px",
                lineHeight: "24px",
                textAlign: "center",
                margin: "0 0 32px 0",
              }}
            >
              Click the button below to sign in to your account.
              <br />
              This link expires in 24 hours.
            </Text>

            <Button
              href={url}
              style={{
                backgroundColor: "#00F5D4",
                color: "#0A0A0F",
                fontWeight: "700",
                fontSize: "15px",
                padding: "14px 32px",
                borderRadius: "12px",
                display: "block",
                textAlign: "center",
                textDecoration: "none",
                boxSizing: "border-box",
                width: "100%",
              }}
            >
              Sign in to Soultrack
            </Button>

            <Hr
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                borderStyle: "solid",
                borderWidth: "1px",
                margin: "28px 0",
              }}
            />

            <Text
              style={{
                color: "#8080A0",
                fontSize: "12px",
                textAlign: "center",
                margin: "0 0 8px 0",
              }}
            >
              Or copy this link into your browser:
            </Text>
            <Link
              href={url}
              style={{
                color: "#00F5D4",
                fontSize: "11px",
                display: "block",
                textAlign: "center",
                wordBreak: "break-all",
              }}
            >
              {url}
            </Link>

            <Text
              style={{
                color: "#8080A0",
                fontSize: "12px",
                textAlign: "center",
                margin: "20px 0 0 0",
              }}
            >
              If you did not request this email, you can safely ignore it.
            </Text>
          </Section>

          {/* フッター */}
          <Section style={{ marginTop: "28px", textAlign: "center" }}>
            <Text
              style={{
                color: "#8080A0",
                fontSize: "11px",
                margin: "0 0 4px 0",
              }}
            >
              © {new Date().getFullYear()} Soultrack · AI-powered music from your emotions
            </Text>
            <Text
              style={{
                color: "#505060",
                fontSize: "11px",
                margin: 0,
              }}
            >
              This is an automated email. Please do not reply.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

MagicLinkEmail.PreviewProps = {
  url: "https://soultrack.io/api/auth/callback/resend?token=preview&email=user%40example.com",
} satisfies MagicLinkEmailProps

export default MagicLinkEmail
