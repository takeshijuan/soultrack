import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SoultrackLogo, { SoultrackIcon } from '@/components/SoultrackLogo'

describe('SoultrackIcon', () => {
  it('renders SVG with default size', () => {
    const { container } = render(<SoultrackIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.getAttribute('width')).toBe('24')
    expect(svg?.getAttribute('height')).toBe('24')
  })

  it('uses size prop for width and height', () => {
    const { container } = render(<SoultrackIcon size={32} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
    expect(svg?.getAttribute('height')).toBe('32')
  })

  it('explicit width/height override size prop', () => {
    const { container } = render(<SoultrackIcon size={24} width={40} height={40} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('40')
    expect(svg?.getAttribute('height')).toBe('40')
  })

  it('renders S-wave path with currentColor stroke', () => {
    const { container } = render(<SoultrackIcon />)
    const path = container.querySelector('path')
    expect(path?.getAttribute('stroke')).toBe('currentColor')
    expect(path?.getAttribute('d')).toContain('M 17 6')
  })

  it('is aria-hidden by default', () => {
    const { container } = render(<SoultrackIcon />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('SoultrackLogo', () => {
  it('renders icon only when showWordmark is false (default)', () => {
    const { container } = render(<SoultrackLogo />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.queryByText('SOULTRACK')).not.toBeInTheDocument()
  })

  it('renders wordmark when showWordmark is true', () => {
    render(<SoultrackLogo showWordmark />)
    expect(screen.getByText('SOULTRACK')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<SoultrackLogo className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
