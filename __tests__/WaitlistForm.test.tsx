import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import WaitlistForm from '@/components/WaitlistForm'

describe('WaitlistForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders email input and submit button', () => {
    render(<WaitlistForm />)
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get Early Access' })).toBeInTheDocument()
  })

  it('shows success state after successful submit', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })
    render(<WaitlistForm />)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Get Early Access' }))
    await waitFor(() =>
      expect(screen.getByText(/You're on the list/)).toBeInTheDocument()
    )
    expect(fetch).toHaveBeenCalledWith('/api/waitlist', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    }))
  })

  it('shows error state when API returns !ok', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false })
    render(<WaitlistForm />)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Get Early Access' }))
    await waitFor(() =>
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    )
  })

  it('shows error state when fetch throws', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
    render(<WaitlistForm />)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Get Early Access' }))
    await waitFor(() =>
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    )
  })

  it('disables button and input during loading', async () => {
    let resolve!: (v: unknown) => void
    global.fetch = vi.fn().mockReturnValueOnce(new Promise(r => { resolve = r }))
    render(<WaitlistForm />)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByPlaceholderText('your@email.com')).toBeDisabled()
    resolve({ ok: true })
  })

  it('does not call fetch again when submitted while loading', async () => {
    let resolve!: (v: unknown) => void
    global.fetch = vi.fn().mockReturnValueOnce(new Promise(r => { resolve = r }))
    render(<WaitlistForm />)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(fetch).toHaveBeenCalledTimes(1)
    resolve({ ok: true })
  })

  it('success state renders correct text', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })
    render(<WaitlistForm />)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Get Early Access' }))
    await waitFor(() =>
      expect(screen.getByText(/We'll let you know when member accounts launch/)).toBeInTheDocument()
    )
  })

  it('error state renders "try again" text', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false })
    render(<WaitlistForm />)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Get Early Access' }))
    await waitFor(() =>
      expect(screen.getByText(/Please try again/)).toBeInTheDocument()
    )
  })
})
