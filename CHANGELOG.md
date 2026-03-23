# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0.0] - 2026-03-23

### Added
- **Auth.js v5 member system** — password-free magic link login via Resend; authenticated users get unlimited track generation and a persistent library
- `auth.config.ts` — Edge-compatible Auth.js config (no adapter) for middleware
- `auth.ts` — Full Auth.js setup with UpstashRedisAdapter (Vercel KV) + JWT session strategy
- `app/api/auth/[...nextauth]/route.ts` — Auth.js route handlers
- `app/api/save-track/[trackId]/route.ts` — POST to add track to library, DELETE to remove with undo-toast support; both handlers wrapped in try/catch
- `app/auth/signin/page.tsx` — Magic link email input page with sr-only label and redirect context
- `app/auth/verify/page.tsx` — Post-email check page with spam folder guidance and back link
- `app/auth/error/page.tsx` — Auth error page (expired/invalid link) with retry link
- `app/my-tracks/page.tsx` — Authenticated track library with emotionColor left-border accent and delete UX
- `components/UserButton.tsx` — Server Component header auth UI (マイトラック / ログアウト links)
- `components/SaveToLibraryButton.tsx` — Teal CTA to save track with error state
- `components/DeleteTrackButton.tsx` — Optimistic delete with 3s undo toast and double-click guard
- `lib/kv.ts` — `saveTrackToLibrary`, `getUserTrackIds` (dedup'd, 50-item cap), `getUserTracks`, `isTrackInLibrary`; `userId` field on `TrackRecord` for permanent storage
- `lib/kv.test.ts` — 14 unit tests for all KV library functions including TTL branching, dedup, and expiry filtering
- **Soultrack brand logo** — `SoultrackIcon` SVG component (S-wave mark) in `components/SoultrackLogo.tsx`
- **Browser favicon** — `app/icon.tsx` (32×32 Edge ImageResponse, teal S-wave); replaces `app/favicon.ico`
- **Apple Touch Icon** — `app/apple-icon.tsx` (180×180, dark background); for iOS home screen
- **Emotion-reactive OG images** — `/api/og?id=[ulid]` applies track `emotionColor` to ambient orb and brand icon
- **Privacy Policy page** (`/privacy`), **Terms of Service page** (`/terms`), **Legal hub** (`/legal`)
- **Global footer** (`components/Footer.tsx`) — Privacy Policy / Terms of Service links + copyright
- **`components/LegalSection.tsx`** — shared section component used by legal pages
- **`messages/legal-en.json`** + **`messages/legal-ja.json`** — Japanese law compliant legal content
- `navigation.homeLabel` i18n key added to all 6 locale files

### Changed
- `middleware.ts` — Wrapped with Auth.js `auth()` from `auth.config.ts` for Edge-safe session propagation
- `app/api/generate/route.ts` — Authenticated users skip rate limit; auto-save to library via `kv.lpush`; `remainingToday` in response for unauthenticated CTAs
- `app/layout.tsx` — Left-top `SoultrackIcon` + right-top `UserButton` + `LocaleSwitcher`; `clientMessages` excludes legal keys (~8KB/request saving); `suppressHydrationWarning` for Auth.js
- `app/track/[id]/page.tsx` — `auth()` + `getTrack()` parallelized via `Promise.all`; `SaveToLibraryButton` with `initialSaved` state
- `i18n/request.ts` — merge pipeline: `en.json + legal-en.json` → base; `ja` adds `legal-ja.json`; other locales use English legal fallback
- `__tests__/middleware.test.ts` — Added `vi.mock('next-auth')` for Edge runtime compatibility

### Fixed
- `lib/kv.ts` — `saveTrackToLibrary` guards against overwriting existing track ownership (cross-user protection)
- `components/DeleteTrackButton.tsx` — Added `'deleting'` state with `disabled` prop to prevent double-click race
- `app/api/og/route.tsx` — wrapped `getTrack()` in try/catch; KV failure falls back to defaults
- `app/icon.tsx`, `app/apple-icon.tsx` — added `revalidate = 86400` to avoid per-request Edge invocations

## [0.1.4.1] - 2026-03-22

### Fixed
- `i18n/request.ts` — deep-merge `en.json` as base so partial locale files (e.g. `ja.json`) fall back to English for any missing key; previously missing keys were rendered as raw key names
- `messages/ja.json` — added complete Japanese translations for `hero`, `lp`, `create`, `quiz`, `player`, and `share` sections that were absent in the initial release
- `package.json` — added `@swc/helpers@^0.5.19` as explicit dependency to satisfy `next-intl@4.8.3 → @swc/core@1.15.18` peer requirement and fix CI build failure

## [0.1.4.0] - 2026-03-20

### Added
- Full i18n support via next-intl: English default with 5 locales (en, ja, ko, zh, zh-TW)
- `messages/en.json` — all English strings: hero, LP, create, quiz, player, share, emotions, pool (q1/q2/q3)
- `messages/ja.json` — hand-crafted partial Japanese overrides (emotion names, quiz labels, pool words)
- `messages/ko.json`, `messages/zh.json`, `messages/zh-TW.json` — DeepL-generated translations
- `middleware.ts` — locale detection: `?lang=` query → `NEXT_LOCALE` cookie → `Accept-Language` → `en` fallback; exports `detectLocale()` for unit tests
- `i18n/request.ts` — next-intl `getRequestConfig` reads `x-locale` header set by middleware
- `components/LocaleSwitcher.tsx` — EN/JA/KO/ZH/TW pill switcher, fixed top-right; sets cookie + `router.refresh()`
- `__tests__/middleware.test.ts` — 6 branch tests for `detectLocale()`

### Changed
- `lib/emotions.ts` — **REKEY**: `EMOTION_COLORS` and `EMOTION_LOADING_COPY` rekeyed from Japanese string keys ('穏やか') → English slug keys ('calm'); English slugs are now the single source of truth for the 30-emotion system
- `app/api/generate/route.ts` — Q1/Q3 validation now accepts values from all 5 locale pools; Q2 validates against English slug keys (locale-independent)
- All components (`HeroContent`, `EmotionShowcase`, `GachaQuiz`, `TrackPlayer`, `ShareButtons`) use `useTranslations()` — no hardcoded strings remain
- `app/layout.tsx` — `NextIntlClientProvider` wraps app, `generateMetadata()` returns localized title/description
- `app/page.tsx`, `app/create/page.tsx`, `app/track/[id]/page.tsx` — i18n-aware; track page handles legacy Japanese emotion keys with `t.has()` backward compat
- `__tests__/EmotionShowcase.test.tsx` — wrapped with `NextIntlClientProvider`, queries updated to English labels
- `app/api/generate/generate.test.ts` — rewritten to test combined locale sets and 30-slug EMOTION_COLORS

### Removed
- `lib/pool.ts` and `lib/pool.test.ts` — superseded by `messages/[locale].json`

## [0.1.3.0] - 2026-03-20

### Added
- Apple-style scroll animations on the LP: Hero elements blur-in with stagger on page load (eyebrow → title → tagline → CTA → hint); EmotionShowcase heading and chip grid cascade in on scroll; Footer CTA slides up on scroll
- `HeroContent` client component — hero content extracted to enable framer-motion animations on an otherwise server-rendered page
- `ScrollReveal` reusable component — generic `whileInView` wrapper with Apple ease curve `[0.25, 0.46, 0.45, 0.94]`

### Changed
- EmotionShowcase chips rendered as `motion.button` with `scale 0.85→1` entrance animation on scroll
- DESIGN.md Motion section updated: `LP scroll reveal: 700ms fade, 0.03s chip stagger`

### For contributors
- `vitest.setup.ts`: Added `IntersectionObserver` mock so framer-motion `whileInView` works in jsdom test environment

## [0.1.2.0] - 2026-03-20

### Added
- `EmotionShowcase` on the landing page: tap any emotion chip to feel the ambient background shift — see the synesthetic concept before you create
- Scroll indicator: a gentle ↓ bounce guides visitors to explore past the hero
- Footer CTA ("Generate Today's Track") for visitors who scroll to the bottom
- Emotion badge on track page — shows the emotion that shaped your track, styled in its color

### Changed
- Play/pause buttons in TrackPlayer: replaced emoji with proper SVG icons
- ShareButtons: "Again" replaced with a "自分のトラックを作る →" CTA that drives new sessions

### For contributors
- Test framework: vitest + @testing-library/react with 4 tests for EmotionShowcase
- GitHub Actions CI workflow (runs on push + PR)
- LP hero extracted into its own `min-h-screen` section so scroll indicator anchors to the first viewport

## [0.1.1] - 2026-03-19

### Fixed
- Update MusicGen version hash to latest (`...43055d2d...cb`) to resolve 422 errors from Replicate API
- Prevent Replicate API token exposure in Vercel logs by narrowing error logging to message only

## [0.1.0] - Initial release
