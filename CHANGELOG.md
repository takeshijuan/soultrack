# Changelog

All notable changes to this project will be documented in this file.

## [0.1.8.0] - 2026-03-24

### Changed
- `components/WaitlistForm.tsx` — Early Access フォームにデザインポリッシュを適用: `AnimatePresence mode="wait"` による success/form 切替アニメーション、感情カラー連動の ambient glow ring、input focus 時の emotion-hue フォーカスリング (onFocus/onBlur)、ローディング中の 3点 bounce dot インジケーター、error メッセージの slide-in アニメーション
- `app/page.tsx` — Early Access セクションに `ScrollReveal delay={0.1}` を追加、グラデーションセパレーター追加、"Early Access" ラベルを `--emotion-hue` 連動カラーに変更、サブテキスト "Your emotions. Your soundtrack. First to know." 追加
- `app/globals.css` — `@keyframes dot-bounce` + `.dot-bounce` utility class 追加

### Fixed
- `app/api/waitlist/route.ts` — email バリデーションを正規化前に一本化 (`normalized` 変数)、TLD 最低2文字制約 (`\.[^\s@]{2,}`)、RFC 5321 の最大254文字上限を追加
- `components/WaitlistForm.tsx` — fetch に 10秒 AbortController タイムアウトを追加（Vercel Function ハング時の UX デッドロック防止）

## [0.1.7.0] - 2026-03-24

### Added
- `components/WaitlistForm.tsx` — 4-state email capture form (`idle | loading | success | error`) with double-submit prevention, loading disabled state, and "No spam · Unsubscribe anytime" note
- `app/api/waitlist/route.ts` — POST endpoint that validates email format server-side (regex + null-body guard) and persists to Vercel KV via `kv.sadd` (Redis set, no TTL, deduplication built-in)
- `lib/kv.ts` — `addToWaitlist(email)` abstraction to keep API routes from calling `@vercel/kv` directly
- `app/page.tsx` — "Early Access" section below EmotionShowcase with WaitlistForm
- `TODOS.md` — added waitlist rate limit (P3) and waitlist:count script (P3) to backlog

### Fixed
- `app/api/waitlist/route.ts` — separated JSON parse try/catch from KV try/catch so malformed body returns 400 (not 500); added null-body guard after successful parse

## [0.1.6.4] - 2026-03-23

### Changed
- `components/EmotionShowcase.tsx` — on emotion chip deselect, `--emotion-hue` inline style is now removed via `removeProperty()` rather than reset to hardcoded `#00F5D4`; CSS `:root` default takes effect via cascade (single source of truth)

### Fixed
- `__tests__/EmotionShowcase.test.tsx` — updated deselect assertion from `.toBe('#00F5D4')` to `.toBe('')` to match new `removeProperty` behavior; aligns with existing unmount test pattern

## [0.1.6.3] - 2026-03-23

### Fixed
- `app/layout.tsx` — expanded `twitter` object to include `title`, `description`, and `images`; fixes X (Twitter) card not displaying correctly due to reliance on broken Next.js fallback inheritance across layout/page hierarchy
- `app/track/[id]/page.tsx` — added `twitter.images` explicitly to ensure per-track OG image is used in X card (not root layout's default)

## [0.1.6.2] - 2026-03-23

### Fixed
- `app/layout.tsx` — added `openGraph.url` and `openGraph.siteName` to resolve `og:site_name` and `og:url` not provided warnings
- `app/track/[id]/page.tsx` — added `openGraph.url: /track/${id}` for per-track canonical OG URL

## [0.1.6.1] - 2026-03-23

### Fixed
- `app/layout.tsx` — `metadataBase` fallback changed from `http://localhost:3000` to production URL (`VERCEL_URL` → `https://soultrack.io`); prevents `twitter:image` and OG tags from referencing localhost when `NEXT_PUBLIC_SITE_URL` is not set

## [0.1.6.0] - 2026-03-23

### Added
- **Soultrack brand logo** — `SoultrackIcon` SVG component (S-wave mark: S letterform flowing as sine wave) in `components/SoultrackLogo.tsx`; exports both `SoultrackIcon` and `SoultrackLogo` (with optional wordmark)
- **Emotion-reactive header logo** — fixed top-left icon in `app/layout.tsx` using `color: var(--emotion-hue, #00F5D4)` with 800ms transition; automatically reacts to emotion selection via existing CSS variable infrastructure (zero additional JS)
- **Browser favicon** — `app/icon.tsx` (32×32 Edge ImageResponse, transparent background, teal S-wave); replaces deleted `app/favicon.ico`
- **Apple Touch Icon** — `app/apple-icon.tsx` (180×180, dark background `#0A0A0F`, rounded corners); for iOS home screen
- **Emotion-reactive OG images** — `/api/og?id=[ulid]` now extracts `emotionColor` from the track record and applies it to the ambient orb, brand icon, and tagline; default OG falls back to teal
- `navigation.homeLabel` i18n key added to all 6 locale files (`en`, `ja`, `ko`, `zh`, `zh-TW`)

### Changed
- OG route brand icon added as sibling div above title (not nested inside)
- OG tagline color now follows `emotionColor` instead of hardcoded `#00F5D4`

### Fixed
- `app/api/og/route.tsx` — wrapped `getTrack()` in try/catch; KV failure now gracefully falls back to defaults instead of returning HTTP 500
- `app/icon.tsx`, `app/apple-icon.tsx` — added `revalidate = 86400` to avoid per-request Edge Function invocations
- `app/layout.tsx` — `aria-label` now uses `getTranslations('navigation')` instead of hardcoded Japanese string

## [0.1.5.0] - 2026-03-23

### Added
- **Privacy Policy page** (`/privacy`) — full English + Japanese legal text, robots noindex, `generateMetadata`
- **Terms of Service page** (`/terms`) — full English + Japanese legal text, robots noindex, `generateMetadata`
- **Legal hub page** (`/legal`) — navigation hub linking to Privacy and Terms pages
- **Global footer** (`components/Footer.tsx`) — shows Privacy Policy / Terms of Service links + copyright on all pages via `app/layout.tsx`
- **`components/LegalSection.tsx`** — shared section component (DRY) used by privacy and terms pages
- **`messages/legal-en.json`** — English legal content (Privacy Policy + ToS) generated by legal-advisor agent; Japanese law compliant
- **`messages/legal-ja.json`** — Japanese translation via DeepL; ko/zh-TW/zh fall back to English legal text

### Changed
- `i18n/request.ts` — updated merge pipeline: `en.json + legal-en.json` → `baseMessages`; `ja` locale additionally merges `legal-ja.json`; other locales receive English legal fallback

### Notes
- ⚠️ Contact email placeholder `[YOUR_EMAIL@DOMAIN.com]` must be replaced before publishing (legal requirement under 個人情報保護法)

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
