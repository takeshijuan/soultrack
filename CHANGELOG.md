# Changelog

All notable changes to this project will be documented in this file.

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
