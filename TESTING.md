# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

**vitest v4** + **@testing-library/react** + **jsdom**

## Run Tests

```bash
npm test          # run once
npm run test:watch  # watch mode
```

## Test Directory

```
__tests__/
  EmotionShowcase.test.tsx    # UI interaction tests for emotion chip component
  legal.test.tsx              # LegalSection component: renders title/body, heading level
  middleware.test.ts          # Unit tests for detectLocale() — 6 branch coverage

app/api/generate/
  generate.test.ts            # Allowlist validation: combined locale Q1/Q2/Q3 sets

lib/
  prompts.test.ts             # Unit tests for parseClaudeResponse() and buildClaudePrompt()
  kv.test.ts                  # Unit tests for KV library: saveTrack, updateTrack, saveTrackToLibrary,
                              #   getUserTrackIds (dedup), getUserTracks (expiry filter), isTrackInLibrary
```

## Test Layers

- **Unit tests** (`__tests__/*.test.tsx`): Component render, interactions, state changes
- **Integration**: Not yet configured
- **E2E**: Not yet configured (consider Playwright for critical flows)

## Conventions

- File naming: `__tests__/<ComponentName>.test.tsx`
- Imports: `import { render, screen, fireEvent } from '@testing-library/react'`
- Assertions: `@testing-library/jest-dom` matchers (`toBeInTheDocument`, `toHaveAttribute`)
- Setup/teardown: `beforeEach`/`afterEach` for DOM cleanup
- Accessibility-first queries: prefer `getByRole` over `getByTestId`
