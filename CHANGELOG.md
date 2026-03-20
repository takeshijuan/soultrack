# Changelog

All notable changes to this project will be documented in this file.

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
