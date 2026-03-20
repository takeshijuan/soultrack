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
See `lib/emotions.ts` for full map.

## Decisions Log
| Date       | Decision | Rationale |
|------------|----------|-----------|
| 2026-03-18 | Chromatic Emotion direction | Differentiates from Suno/Udio purple-gradient convergence |
| 2026-03-18 | Clash Grotesk + DM Sans | Strong display + clean body; nobody in AI music uses this combo |
| 2026-03-18 | Emotion-reactive background | Synesthesia concept perfectly mirrors "music of your moment" |
| 2026-03-18 | Teal+Amber (no purple) | Deliberate anti-slop: electric teal is fresh in this category |
| 2026-03-19 | Vercel Blob audio persistence | Replicate temp URLs expire; Blob keeps audio available long-term |
| 2026-03-19 | emotionColor XSS validation | Hex regex guard before injecting into `<style>` tag |
| 2026-03-20 | EmotionShowcase on LP | Interactive chip grid lets visitors feel the synesthetic concept before committing to /create |
| 2026-03-20 | useEffect cleanup for --emotion-hue | LP chip selection sets CSS var; cleanup on unmount prevents color leak to other pages |
