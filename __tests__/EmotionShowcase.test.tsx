import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import EmotionShowcase from '@/components/EmotionShowcase'
import enMessages from '../messages/en.json'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={enMessages}>
    {children}
  </NextIntlClientProvider>
)

describe('EmotionShowcase', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--emotion-hue')
  })

  afterEach(() => {
    document.documentElement.style.removeProperty('--emotion-hue')
  })

  it('renders emotion chips for all emotions', () => {
    render(<EmotionShowcase />, { wrapper })
    expect(screen.getByRole('button', { name: 'Try Calm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try Joy' })).toBeInTheDocument()
  })

  it('activates chip on click and sets --emotion-hue CSS variable', () => {
    render(<EmotionShowcase />, { wrapper })
    const btn = screen.getByRole('button', { name: 'Try Calm' })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.style.getPropertyValue('--emotion-hue')).toBeTruthy()
  })

  it('deactivates chip on second click and removes --emotion-hue inline style', () => {
    render(<EmotionShowcase />, { wrapper })
    const btn = screen.getByRole('button', { name: 'Try Calm' })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(document.documentElement.style.getPropertyValue('--emotion-hue')).toBe('')
  })

  it('removes --emotion-hue on unmount', () => {
    const { unmount } = render(<EmotionShowcase />, { wrapper })
    const btn = screen.getByRole('button', { name: 'Try Joy' })
    fireEvent.click(btn)
    unmount()
    expect(document.documentElement.style.getPropertyValue('--emotion-hue')).toBe('')
  })
})
