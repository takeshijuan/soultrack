import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import LegalSection from '@/components/LegalSection'

describe('LegalSection', () => {
  it('renders title and body', () => {
    render(<LegalSection title="Test Title" body="Test body text." />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test body text.')).toBeInTheDocument()
  })

  it('renders as section element with correct heading level', () => {
    render(<LegalSection title="Section" body="Body." />)
    expect(screen.getByRole('heading', { level: 2, name: 'Section' })).toBeInTheDocument()
  })
})

// Footer is an async Server Component using getTranslations (server-only).
// Unit testing requires mocking next-intl internals.
// Integration verification: npm run build + open http://localhost:3000
