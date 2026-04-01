import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import TrackPlayer from '@/components/TrackPlayer'
import enMessages from '../messages/en.json'

// Mock framer-motion to avoid JSDOM animation issues
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    useReducedMotion: () => false,
  }
})

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
  EVENTS: { TRACK_PLAY: 'track_play', GENERATION_COMPLETE: 'generation_complete' },
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={enMessages}>
    {children}
  </NextIntlClientProvider>
)

const baseProps = {
  trackId: 'test-track-id',
  initialStatus: 'done' as const,
  initialAudioUrl: 'https://example.com/audio.mp3',
  title: 'Test Track',
  copy: 'A test description',
  emotion: 'calm',
}

describe('TrackPlayer', () => {
  it('renders title and copy in done state', () => {
    render(<TrackPlayer {...baseProps} />, { wrapper })
    expect(screen.getByText('Test Track')).toBeInTheDocument()
    expect(screen.getByText('A test description')).toBeInTheDocument()
  })

  it('renders play button with correct aria-label', () => {
    render(<TrackPlayer {...baseProps} />, { wrapper })
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('renders progress bar with progressbar role', () => {
    render(<TrackPlayer {...baseProps} />, { wrapper })
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders error state for failed status', () => {
    render(<TrackPlayer {...baseProps} initialStatus="failed" />, { wrapper })
    expect(screen.getByText('Generation failed.')).toBeInTheDocument()
    expect(screen.getByText('Try again →')).toBeInTheDocument()
  })

  it('renders error state for timeout status', () => {
    render(<TrackPlayer {...baseProps} initialStatus="timeout" />, { wrapper })
    expect(screen.getByText('Generation timed out.')).toBeInTheDocument()
  })

  it('hides copy text in compact mode (trackSize=short)', () => {
    render(<TrackPlayer {...baseProps} trackSize="short" />, { wrapper })
    expect(screen.getByText('Test Track')).toBeInTheDocument()
    expect(screen.queryByText('A test description')).not.toBeInTheDocument()
  })

  it('shows copy text in full mode (trackSize=long)', () => {
    render(<TrackPlayer {...baseProps} trackSize="long" />, { wrapper })
    expect(screen.getByText('Test Track')).toBeInTheDocument()
    expect(screen.getByText('A test description')).toBeInTheDocument()
  })

  it('uses smaller play button in compact mode', () => {
    const { container } = render(<TrackPlayer {...baseProps} trackSize="short" />, { wrapper })
    const button = screen.getByRole('button', { name: 'Play' })
    expect(button.className).toContain('w-12')
    expect(button.className).toContain('h-12')
  })

  it('uses larger play button in full mode', () => {
    render(<TrackPlayer {...baseProps} trackSize="long" />, { wrapper })
    const button = screen.getByRole('button', { name: 'Play' })
    expect(button.className).toContain('w-16')
    expect(button.className).toContain('h-16')
  })

  it('defaults to full mode when trackSize is undefined', () => {
    render(<TrackPlayer {...baseProps} />, { wrapper })
    const button = screen.getByRole('button', { name: 'Play' })
    expect(button.className).toContain('w-16')
    expect(button.className).toContain('h-16')
  })

  it('renders 32 waveform bars', () => {
    const { container } = render(<TrackPlayer {...baseProps} />, { wrapper })
    // Waveform is the first flex container with gap-[3px] inside the card
    const waveform = container.querySelector('.gap-\\[3px\\]')
    expect(waveform).toBeInTheDocument()
    const bars = waveform!.children
    expect(bars.length).toBe(32)
  })

  it('renders share buttons', () => {
    render(<TrackPlayer {...baseProps} />, { wrapper })
    expect(screen.getByText('Share on X')).toBeInTheDocument()
  })
})

// Test formatTime independently via module boundary
describe('formatTime (via TrackPlayer rendering)', () => {
  it('does not show time display when duration is 0', () => {
    const { container } = render(<TrackPlayer {...baseProps} />, { wrapper })
    // No tabular-nums element should be present when duration=0
    const timeDisplay = container.querySelector('.tabular-nums')
    expect(timeDisplay).not.toBeInTheDocument()
  })
})
