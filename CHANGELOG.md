# Changelog

All notable changes to this project will be documented in this file.

## [0.1.2.0] - 2026-03-20

### Added
- `EmotionShowcase` component: interactive emotion chip grid on LP — tap a chip to shift the ambient background color, with CSS variable cleanup on unmount to prevent color leak to other pages
- Scroll indicator (↓ bounce animation) anchored to hero section viewport
- Footer CTA on LP ("Generate Today's Track") for users who scroll past the hero
- Emotion badge on track page — displays the track's emotion with its color
- Test framework: vitest + @testing-library/react with 4 tests for EmotionShowcase
- GitHub Actions CI workflow

### Changed
- LP hero layout: extracted into independent `min-h-screen` section so `justify-center` works correctly when scrollable content follows
- Play/pause buttons in TrackPlayer: replaced emoji (⏸▶) with proper SVG icons
- ShareButtons: replaced "Again" button with a styled "自分のトラックを作る →" CTA link

### Removed
- "Again" button from ShareButtons (replaced by more prominent CTA)

## [0.1.1] - 2026-03-19

### Fixed
- Update MusicGen version hash to latest (`...43055d2d...cb`) to resolve 422 errors from Replicate API
- Prevent Replicate API token exposure in Vercel logs by narrowing error logging to message only

## [0.1.0] - Initial release
