import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import EmotionShowcase from '@/components/EmotionShowcase'

describe('EmotionShowcase', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--emotion-hue')
  })

  afterEach(() => {
    document.documentElement.style.removeProperty('--emotion-hue')
  })

  it('renders emotion chips for all emotions', () => {
    render(<EmotionShowcase />)
    expect(screen.getByRole('button', { name: '穏やかを試す' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '喜びを試す' })).toBeInTheDocument()
  })

  it('activates chip on click and sets --emotion-hue CSS variable', () => {
    render(<EmotionShowcase />)
    const btn = screen.getByRole('button', { name: '穏やかを試す' })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.style.getPropertyValue('--emotion-hue')).toBeTruthy()
  })

  it('deactivates chip on second click and resets --emotion-hue to teal', () => {
    render(<EmotionShowcase />)
    const btn = screen.getByRole('button', { name: '穏やかを試す' })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(document.documentElement.style.getPropertyValue('--emotion-hue')).toBe('#00F5D4')
  })

  it('removes --emotion-hue on unmount', () => {
    const { unmount } = render(<EmotionShowcase />)
    const btn = screen.getByRole('button', { name: '喜びを試す' })
    fireEvent.click(btn)
    unmount()
    expect(document.documentElement.style.getPropertyValue('--emotion-hue')).toBe('')
  })
})
