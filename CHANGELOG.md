# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0.0] - 2026-04-01

### Added
- **Google Lyria 3 Pro music generation** — generate up to 2-minute tracks with natural song structure (intro, verse, chorus, outro) via Gemini API. Select between 30-second quick vibes and 2-minute full tracks
- **Duration selection UI** — choose track length during the emotional quiz, styled as emotion chips matching the Chromatic Emotion design system. i18n across all 5 locales
- **Multi-phase loading UX** — 5-stage animated loading text that evolves with generation progress ("Composing your emotional soundtrack..." → "Shaping the melody..." → "Almost there...")
- **Fallback notification** — when the AI service falls back to a shorter track, a toast notification lets you retry the full-length version
- **PostHog analytics** — funnel tracking from quiz start through generation, playback, and sharing. Client provider with graceful degradation when unconfigured
- **Lyria provider with `generateSync`** — new `MusicGenerationProvider` interface extension supporting synchronous generation. Background processing via Next.js `after()` API for instant response
- **Replicate fallback** — automatic fallback to MusicGen if Lyria is unavailable, with structured error handling and safety filter detection
- **Provider factory** — two-layer provider selection: `MUSIC_PROVIDER` env var selects the family (replicate/lyria), duration parameter selects the model variant (clip/pro)

### Changed
- **Generate route** — switched to Node.js runtime with `maxDuration=120`, instant trackId response via `after()` background generation pattern
- **Status endpoint** — provider-aware branching: Lyria tracks return KV state directly (no polling), Replicate tracks poll as before. 3-minute timeout detection for stuck generations
- **TrackRecord schema** — `predictionId` now optional, added `provider` and `requestedDuration` fields for multi-provider support
- **Loading time estimate** — updated from "30-60 seconds" to "30-90 seconds" across all locales

### Fixed
- **robots.ts** — fixed broken indentation from upstream merge, removed invalid `/$` and `/&` disallow rules

## [0.2.8.1] - 2026-03-30

### Added
- **CLAUDE.md** — project-level AI agent configuration with workflow orchestration rules, task management guidelines, core principles, and gstack skill routing

## [0.2.8.0] - 2026-03-28

### Added
- **My Tracks page polish** — staggered fade-blur entry animations (framer-motion), emotion color badge pills matching track page design, relative time display ("2h ago" / "3日前"), hover glow effects with emotion-reactive colors
- **Empty library state** — animated S-wave brand icon with teal glow, warm messaging, teal CTA button matching LP/create page style
- **Loading skeleton** (`app/my-tracks/loading.tsx`) — skeleton UI for slow KV fetch, prevents blank page during cold starts
- **i18n keys** — eyebrow text, track count, relative time labels, and empty state messaging across all 5 locales (en, ja, ko, zh, zh-TW)

### Changed
- **My Tracks page structure** — server component now localizes emotion names server-side via `tEmotions.has()` pattern (matching track page), delegates rendering to `TrackList` and `EmptyLibrary` client components
- **Delete button** — restyled as compact rounded icon button integrated inside track cards with hover-reveal on desktop, always visible on mobile; 44px touch target preserved via negative margin technique; undo state upgraded to pill-style badge
- **Back navigation** — added "← Soultrack" breadcrumb matching track page pattern
- **CTA button** — upgraded from plain muted text link to teal rounded-full button with hover glow, matching LP/create page CTA style
- **Header** — added uppercase eyebrow text, Clash Grotesk display font heading (text-3xl/4xl), and track count

### Tests
- **formatRelativeTime unit tests** — 6 test cases covering all time buckets (just now, minutes, hours, days, weeks) and falsy input edge case

## [0.2.7.0] - 2026-03-26

### Fixed
- **OG meta tags** — comprehensive fix for X (Twitter) card display: added `og:image:width`, `og:image:height`, `og:image:type`, `og:image:alt`, and `og:type` to both track pages and root layout; images format changed from string array to object array with explicit dimensions (1200x630)
- **OG image resilience** — added try-catch fallback in `/api/og` route so rendering failures return a simple branded image instead of 500
- **OG cache strategy** — added `Cache-Control` headers with conditional caching: 24h for successfully loaded tracks, 60s for KV-failure fallback to prevent stale cache poisoning

### Tests
- **OG metadata regression tests** — 2 new tests verifying `og:image` dimensions/type and `twitter:image` dimensions in `generateMetadata` output

## [0.2.6.1] - 2026-03-26

### Added
- **Shared locale utility** (`lib/locale.ts`) — `resolveLocale()` extracted from middleware for reuse in API routes; `VALID_LOCALES` type and Set for validation
- **Locale-aware prompt generation** (`lib/prompts.ts`) — `buildClaudePrompt()` now accepts locale parameter; system prompt instructs Claude to generate title/copy in the user's language; per-locale example title/copy for all 5 languages; `musicPrompt` always English (audio model requirement)
- **Locale tests** (`lib/locale.test.ts`) — 6 test cases covering cookie priority, Accept-Language fallback, invalid/prototype-key rejection
- **Prompt locale tests** (`lib/prompts.test.ts`) — 7 new tests verifying language instruction and example for each locale

### Changed
- **`/api/generate`** reads `NEXT_LOCALE` cookie + `Accept-Language` directly (middleware excludes `/api` routes from its matcher, so `x-locale` header was never available)
- **`middleware.ts`** refactored to delegate cookie + Accept-Language resolution to shared `resolveLocale()` from `lib/locale.ts`; `?lang=` query param handling remains middleware-only
- **X share text** — emotion-aware storytelling template across all 5 locales; added missing JA `xTemplate`; `#AImusic` hashtags

### Fixed
- **Song titles generated in wrong language** — titles/copy always came back in Japanese regardless of user locale because prompt had only a Japanese example and no language instruction

## [0.2.6.0] - 2026-03-26

### Added
- **Custom 404 page** (`app/not-found.tsx`) — proper 404 response for all unknown URLs (`/$`, `/&`, etc.) instead of default Next.js fallback; fixes GSC "見つかりませんでした（404）" reports
- **CreateForm client component** (`components/CreateForm.tsx`) — extracted interactive form/error/loading logic as client island for `/create` SSR

### Changed
- **Legal pages now indexable** — removed `robots: { index: false, follow: false }` from `/privacy` and `/terms`; added both to sitemap with yearly change frequency and 0.3 priority
- **/create page SSR** — converted from full client component to Server Component with SSR heading/subtext; improves Googlebot content visibility and fixes GSC "クロール済み - インデックス未登録"

## [0.2.5.1] - 2026-03-26

### Changed
- **X share text** — emotion-aware storytelling template across all 5 locales; "I told AI how I feel (calm) and it made me a song" format replaces generic "the music of my moment"; added `#AImusic` / `#AI音楽` hashtags for discoverability
- **Japanese share template** — added missing `xTemplate` key (previously fell back to English)
- **ShareButtons** — now receives `emotion` prop from `TrackPlayer` and resolves localized emotion label via `useTranslations('emotions')`

## [0.2.5.0] - 2026-03-25

### Added
- **Dynamic sitemap** (`app/sitemap.ts`) — track pages from KV sorted set `sitemap:tracks`; ISR with 1-hour revalidation; ULID `decodeTime` for `lastModified`; try/catch for invalid ULID resilience
- **Sitemap KV index** (`lib/kv.ts`) — `addTrackToSitemap`/`getSitemapTrackIds` using Redis sorted set (`zadd`/`zrange`); hooks in `updateTrack` (status=done + userId) and `saveTrackToLibrary`
- **Backfill script** (`scripts/backfill-sitemap.ts`) — one-off script to index existing permanent tracks (userId + status=done) with per-record error handling

### Changed
- **Sitemap scope** — removed `legal`, `privacy`, `terms` pages (already have `robots: { index: false }` metadata)

### Tests
- `lib/kv.test.ts` — 8 new tests for sitemap index functions (zadd/zrange), updateTrack hook conditions, saveTrackToLibrary hook conditions

## [0.2.4.0] - 2026-03-24

### Added
- **Custom magic link email** (`emails/MagicLinkEmail.tsx`) — Chromatic Emotion branded React Email template with dark background (`#0A0A0F`), teal CTA button (`#00F5D4`), DM Sans web font, color-scheme dark mode meta, and fallback URL for email clients without button support
- **Email template tests** (`emails/MagicLinkEmail.test.tsx`) — 4 Vitest tests covering HTML render, plaintext render, brand color, and CTA href correctness
- **`email:dev` script** — `react-email` + `@react-email/preview-server` for local email template iteration (`npm run email:dev`)
- **`AUTH_RESEND_KEY`** documented in `.env.local.example`

### Changed
- **Magic link emails now look like Soultrack** — the default Resend template has been replaced with a fully branded send; dark background, teal CTA, and DM Sans font match the app's Chromatic Emotion aesthetic end-to-end

## [0.2.3.0] - 2026-03-24

### Added
- **robots.txt** (`app/robots.ts`) — Next.js MetadataRoute-powered `/robots.txt` generation; disallows `/auth/`, `/api/`, `/my-tracks/`; references sitemap.xml
- **sitemap.xml** (`app/sitemap.ts`) — static sitemap with 5 pages (`/`, `/create`, `/legal`, `/privacy`, `/terms`)
- **JSON-LD AudioObject** on track pages — Schema.org structured data for Google Rich Results; XSS-safe via Unicode escaping; `contentUrl` excluded (Replicate signed URL risk)
- **Create page metadata** (`app/create/layout.tsx`) — dedicated title/description for the create flow

### Changed
- **Track page SEO** (`app/track/[id]/page.tsx`) — dynamic title (`"Title — Soultrack"`), description (track copy → emotion fallback → default), OpenGraph with `siteName`, Twitter `summary_large_image` card
- **React.cache deduplication** — `getTrack` wrapped with `React.cache` to prevent double KV fetch between `generateMetadata` and page render
- **ULID validation** — `generateMetadata` and `TrackPage` now validate track ID format before KV lookup (matches `/api/og` guard)

### Tests
- `__tests__/track-page-metadata.test.ts` — 11 new tests covering ULID validation, title/description fallback chains, KV error handling

## [0.2.2.1] - 2026-03-24

### Docs
- `TODOS.md` — added "サインインメールのデザインポリッシュ" (Auth, P2) and "My Tracksページのデザインポリッシュ" (My Tracks, P2)

## [0.2.2.0] - 2026-03-24

### Added
- **SubmitButton client component** (`app/auth/_components/SubmitButton.tsx`) — `useFormStatus`-powered submit button with teal CTA (`#00F5D4`), animated spinner, and "Sending…" loading state; fully disabled while form is submitting

### Changed
- **Sign-in page** — teal envelope SVG icon, Clash Grotesk heading (`signInTitle`), glass-card form (`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8`), teal focus ring on email input, `SubmitButton` replaces plain `<button>`
- **Verify-email page** — float-animated teal envelope SVG replaces `✉️` emoji; heading upgraded to `font-display`
- **Error page** — amber circle-X SVG icon, `font-display` heading, amber-styled dev error badge, teal "Try again" CTA matching the rest of the design system
- `messages/{en,ja,ko,zh,zh-TW}.json` — added `auth.signInTitle` and `auth.submitLoading` i18n keys

### Tests
- `__tests__/SubmitButton.test.tsx` — new Vitest tests covering pending=false (submit text, enabled) and pending=true (loading text, disabled) states

## [0.2.1.0] - 2026-03-24

### Changed
- **Language switcher is now a dropdown** — clicking the globe + locale code opens a smooth framer-motion list of all 5 locales (EN/JA/KO/ZH/ZH-TW); teal accent on the active choice; Escape key and click-outside to dismiss; full keyboard/screen-reader accessible (`listbox` pattern)

### Fixed
- Auth, library, and component pages now respect your language setting — sign-in, verify-email, error, my-tracks, save, and delete flows were previously hardcoded in Japanese

### Docs
- `DESIGN.md` — added LocaleSwitcher dropdown decision to the decisions log

## [0.2.0.2] - 2026-03-23

### Changed
- `components/UserButton.tsx` — icon-only redesign: replaced text/pill UI with SVG icons + `getTranslations('navigation')` aria-labels; unauthed → user silhouette, authed → music note (my-tracks) + logout arrow
- `components/LocaleSwitcher.tsx` — replaced 5-pill language selector with single globe SVG icon; click cycles en → ja → ko → zh → zh-TW; `aria-label` includes current locale code
- `app/layout.tsx` — removed `w-px` divider between UserButton and LocaleSwitcher; `gap-3` → `gap-1` for icon-only density
- `messages/{en,ja,ko,zh,zh-TW}.json` — added `navigation.login`, `navigation.myTracks`, `navigation.logout`, `navigation.switchLanguage` i18n keys

## [0.2.0.1] - 2026-03-23

### Changed
- `app/layout.tsx` — added vertical divider (`w-px h-3.5 bg-white/10`) between `UserButton` and `LocaleSwitcher`; tightened gap from `gap-4` to `gap-3`
- `components/UserButton.tsx` — unauthenticated login link styled as bordered ghost pill (`border border-white/20`, hover teal); authenticated state uses `|` separator with `gap-1` for compact grouping
- `components/LocaleSwitcher.tsx` — active locale pill gains `bg-[#00F5D4]/10` fill for clearer selected state; border softened to `#00F5D4]/40`; inactive hover adds `hover:border-white/15`; padding enlarged to `px-2 py-1` for better tap targets

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
