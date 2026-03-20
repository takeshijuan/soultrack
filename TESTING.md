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
  EmotionShowcase.test.tsx   # UI interaction tests for emotion chip component
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
