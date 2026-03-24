import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import enMessages from '../messages/en.json'

// Mock useFormStatus to control pending state
let mockPending = false
vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return {
    ...actual,
    useFormStatus: () => ({ pending: mockPending }),
  }
})

import SubmitButton from '@/app/auth/_components/SubmitButton'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={enMessages}>
    {children}
  </NextIntlClientProvider>
)

describe('SubmitButton', () => {
  beforeEach(() => {
    mockPending = false
  })

  it('renders submit text when not pending', () => {
    render(<SubmitButton />, { wrapper })
    expect(screen.getByRole('button')).toHaveTextContent('Send login link')
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('renders loading text and is disabled when pending', () => {
    mockPending = true
    render(<SubmitButton />, { wrapper })
    expect(screen.getByRole('button')).toHaveTextContent('Sending...')
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
