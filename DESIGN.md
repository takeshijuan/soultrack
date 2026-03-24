# Design System — Soultrack

## Product Context
- **What this is:** AI melody generator from 3-question emotional quiz
- **Who it's for:** TikTok generation, Japan/Asia, daily-ritual users
- **Space/industry:** AI music generation, emotional wellness tools
- **Project type:** Viral web app / daily ritual tool

## Aesthetic Direction
- **Direction:** Chromatic Emotion
- **Decoration level:** Intentional
- **Mood:** Synesthetic — your emotional state bleeds into the visual environment.
  The app breathes with you. Selecting your feeling changes the ambient light.

## Typography
- **Display/Hero:** Clash Grotesk 600/700 — strong personality, not overused in AI space
  - Source: `https://api.fontshare.com/v2/css?f[]=clash-grotesk@600,700&display=swap`
- **Body/UI:** DM Sans 300/400/500 — clean, readable, neutral
  - Source: next/font/google
- **Scale:** 10rem hero / 3xl track title / xl section header / sm body / xs label

## Color
- **Approach:** Expressive with restrained base
- **Background:**   #0A0A0F — near-black with faint warm blue
- **Surface-1:**    #111118 — cards
- **Surface-2:**    #17171F — hover/elevated
- **Accent Teal:**  #00F5D4 — energy, Q1 selection glow, CTA
- **Accent Amber:** #FF9A3C — warmth, Q3 selection glow, ambient
- **Emotion Hue:**  CSS var `--emotion-hue` — dynamically set by Q2 selection (create flow) or EmotionShowcase chip tap (LP)
- **Text Primary:** #F0F0F8 — cool white
- **Text Muted:**   #8080A0 — purple-gray (WCAG AA 5.72:1)

## Motion
- **Approach:** Intentional
- **Ambient drift:** 25-30s infinite alternate (CSS keyframes)
- **Emotion cascade:** 800ms ease (CSS transition on --emotion-hue)
- **Chip select:** 150ms scale bloom (framer-motion)
- **Page enter:** 450ms stagger, 120ms delay per card (framer-motion)
- **Play button pulse:** 1.5s infinite glow (framer-motion)
- **Celebration burst:** 700ms particle scatter on processing→done (framer-motion)
- **LP scroll reveal:** 700ms fade/slide, 0.03s chip stagger, Apple ease `[0.25,0.46,0.45,0.94]`

## Emotion Color Map (`lib/emotions.ts`)
30 emotions, each mapped to a hex color that drives `--emotion-hue` when selected.
Keys are English slugs (`calm`, `anxiety`, ...) — locale-independent single source of truth.
Translated display names live in `messages/[locale].json` under `emotions.*`.
See `lib/emotions.ts` for full map.

## Brand Icon

- **Mark:** S-wave — S letterform flowing as a sine wave
  - SVG path: `M 17 6 C 17 3, 8 3, 7 7 C 6 11, 16 13, 16 17 C 16 21, 7 21, 7 18` (viewBox 0 0 24 24)
  - `strokeWidth="2.5"`, `strokeLinecap="round"`, `fill="none"`
  - Uses `stroke="currentColor"` → inherits color from parent CSS
- **Color:** `var(--emotion-hue, #00F5D4)` — automatically follows emotion selection with 800ms transition
- **Component:** `components/SoultrackLogo.tsx` — exports `SoultrackIcon` (SVG only) and `SoultrackLogo` (with optional wordmark)
- **Usage:**
  - Header: `<SoultrackIcon size={24} />` in fixed top-left Link (44px touch target)
  - Favicon: `app/icon.tsx` (32×32, transparent bg, Edge Runtime, 1-day cache)
  - Apple Touch Icon: `app/apple-icon.tsx` (180×180, `#0A0A0F` bg, 36px border-radius, 1-day cache)
  - OG image: inline SVG at 56×56 in `/api/og` (direct `stroke={emotionColor}` — Satori doesn't inherit `currentColor`)

## Decisions Log
| Date       | Decision | Rationale |
|------------|----------|-----------|
| 2026-03-23 | S-wave mark (not soundwave/note) | Competitors (Suno/Udio) all use waveform logos; S-wave expresses "S for Soul" + wave simultaneously |
| 2026-03-23 | Emotion-reactive icon color | Zero JS cost — reuses `--emotion-hue` CSS var already set by GachaQuiz + track page |
| 2026-03-23 | favicon.ico deleted, icon.tsx used | Next.js App Router prioritizes `favicon.ico` over `icon.tsx`; deletion required for branded favicon |
| 2026-03-18 | Chromatic Emotion direction | Differentiates from Suno/Udio purple-gradient convergence |
| 2026-03-18 | Clash Grotesk + DM Sans | Strong display + clean body; nobody in AI music uses this combo |
| 2026-03-18 | Emotion-reactive background | Synesthesia concept perfectly mirrors "music of your moment" |
| 2026-03-18 | Teal+Amber (no purple) | Deliberate anti-slop: electric teal is fresh in this category |
| 2026-03-19 | Vercel Blob audio persistence | Replicate temp URLs expire; Blob keeps audio available long-term |
| 2026-03-19 | emotionColor XSS validation | Hex regex guard before injecting into `<style>` tag |
| 2026-03-20 | EmotionShowcase on LP | Interactive chip grid lets visitors feel the synesthetic concept before committing to /create |
| 2026-03-20 | useEffect cleanup for --emotion-hue | LP chip selection sets CSS var; cleanup on unmount prevents color leak to other pages |
| 2026-03-20 | i18n via next-intl (no URL prefix) | Clean URLs (/track/[id] stays as-is); locale via ?lang= → cookie → Accept-Language → en |
| 2026-03-20 | EMOTION_COLORS rekeyed to English slugs | Locale-independent Q2 validation; translated names in messages/[locale].json |
| 2026-03-20 | Language switcher pill (top-right fixed) | Non-intrusive; sets NEXT_LOCALE cookie + router.refresh() for immediate re-render |
| 2026-03-23 | Header icon-only redesign (UserButton + LocaleSwitcher → SVG icons) | Reduces visual noise; 3 icons replace text+pill cluster; aria-labels via i18n ensure full accessibility |
| 2026-03-24 | LocaleSwitcher: globe + locale code trigger → framer-motion dropdown (listbox pattern) | Cycling was opaque — dropdown makes all 5 locales visible at once; `aria-haspopup="listbox"` + `aria-expanded` + `role="option"` gives full a11y; Escape + click-outside to close |
| 2026-03-23 | UserButton: user silhouette (unauthed) / music note + logout arrow (authed) | Iconography matches product category (music); tap targets p-2 -m-1 for 40px effective area |
| 2026-03-23 | Global footer (Privacy Policy + ToS links) | Legal disclosure requirement under 個人情報保護法 and Vercel Analytics data collection |
| 2026-03-23 | Legal body text: text-white/70 (not text-muted) | WCAG AA compliance (4.5:1 contrast) for long-form legal reading |
| 2026-03-23 | robots: noindex on /privacy, /terms, /legal | Legal pages excluded from search engine indexing |
| 2026-03-23 | Legal JSON separated from UI JSON (legal-en.json, legal-ja.json) | Isolates legal content for easier human review and compliance audit |
| 2026-03-24 | Custom magic link email (React Email + `sendVerificationRequest`) | Default Resend template breaks Chromatic Emotion immersion; branded dark email (`#0A0A0F` bg, `#00F5D4` CTA, DM Sans) keeps the design system consistent from web to inbox |
| 2026-03-23 | Magic link login via Auth.js v5 + Resend | Zero-friction registration — no password to remember or reset; Resend handles email deliverability |
| 2026-03-23 | JWT session strategy (not database sessions) | Edge runtime compatibility: auth.config.ts (adapter-less) for middleware, auth.ts (full) for API routes |
| 2026-03-23 | Unlimited tracks for authenticated users; 3/day for anonymous | Viral loop: users who hit the daily cap are motivated to register rather than abandon |
| 2026-03-23 | TTL 24h for anonymous tracks; persistent for authenticated | Encourages account creation for track preservation while keeping KV storage bounded for anonymous users |
| 2026-03-23 | CONTACT_EMAIL env var with contact@soultrack.io fallback | Complies with 個人情報保護法 without blocking deployment; override per environment in Vercel dashboard |
