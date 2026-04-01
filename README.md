# Soultrack

AI-powered BGM generator — answer 3 questions about your emotional state, get a unique track.

## Features

- 🎵 AI track generation (Google Lyria 3 Pro with Replicate fallback)
- 🔐 Password-free magic link auth (Auth.js v5 + Resend)
- 📚 Personal track library (Vercel KV / Upstash Redis)
- 🌏 i18n: EN / JA / KO / ZH / ZH-TW (next-intl)
- 🎨 Emotion-reactive ambient UI
- 📱 OG images, favicon, Apple Touch Icon per track

## Quick Start

```bash
npm install
cp .env.example .env.local  # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `AUTH_RESEND_KEY` | ✅ | Resend API key (for magic link emails) |
| `KV_REST_API_URL` | ✅ | Vercel KV / Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | ✅ | Vercel KV / Upstash Redis REST token |
| `REPLICATE_API_TOKEN` | ✅ | Replicate API token (MusicGen) |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic Claude API key |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Production URL (e.g. `https://soultrack.io`) |
| `CONTACT_EMAIL` | optional | Contact email for legal pages (default: `contact@soultrack.io`) |

## Testing

```bash
npm test         # run once
npm run test:watch  # watch mode
```

11 test files, 68 tests — see [TESTING.md](./TESTING.md) for details.

## Email Template Development

```bash
npm run email:dev  # local preview server for email templates (react-email)
```

Open [http://localhost:3001](http://localhost:3001) to preview and iterate on `emails/MagicLinkEmail.tsx`.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** Auth.js v5 (next-auth@beta) — magic link via Resend
- **Database:** Vercel KV (Upstash Redis)
- **Music:** Google Lyria 3 Pro (Gemini API) + Replicate MusicGen fallback
- **AI metadata:** Anthropic Claude (claude-sonnet)
- **i18n:** next-intl
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS

## Design

See [DESIGN.md](./DESIGN.md) for the full design system and decision log.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/takeshijuan/soultrack)

Set all required environment variables in the Vercel dashboard before deploying.
