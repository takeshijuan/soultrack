import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import enMessages from '../messages/en.json'

const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

// framer-motion: AnimatePresence renders children immediately in tests
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    ul: ({ children, ...props }: React.ComponentProps<'ul'>) => <ul {...props}>{children}</ul>,
  },
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={enMessages}>
    {children}
  </NextIntlClientProvider>
)

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    mockRefresh.mockClear()
  })

  it('renders globe trigger with current locale code', () => {
    render(<LocaleSwitcher />, { wrapper })
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /switch language/i })).toBeInTheDocument()
  })

  it('opens dropdown when trigger is clicked', () => {
    render(<LocaleSwitcher />, { wrapper })
    const trigger = screen.getByRole('button', { name: /switch language/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('closes dropdown when trigger is clicked again', () => {
    render(<LocaleSwitcher />, { wrapper })
    const trigger = screen.getByRole('button', { name: /switch language/i })
    fireEvent.click(trigger)
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('renders all 5 locale options when open', () => {
    render(<LocaleSwitcher />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /switch language/i }))
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(5)
    expect(options.map(o => o.textContent)).toEqual(['EN', 'JA', 'KO', 'ZH', 'ZH-TW'])
  })

  it('marks current locale as selected', () => {
    render(<LocaleSwitcher />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /switch language/i }))
    const enOption = screen.getByRole('option', { name: 'EN' })
    expect(enOption).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'JA' })).toHaveAttribute('aria-selected', 'false')
  })

  it('sets cookie and calls router.refresh() on locale selection', () => {
    render(<LocaleSwitcher />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /switch language/i }))
    fireEvent.click(screen.getByRole('option', { name: 'JA' }))
    expect(document.cookie).toContain('NEXT_LOCALE=ja')
    expect(mockRefresh).toHaveBeenCalledOnce()
  })

  it('closes dropdown after locale selection', () => {
    render(<LocaleSwitcher />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /switch language/i }))
    fireEvent.click(screen.getByRole('option', { name: 'KO' }))
    expect(screen.getByRole('button', { name: /switch language/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes dropdown on Escape key', () => {
    render(<LocaleSwitcher />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /switch language/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown on click outside', () => {
    render(
      <div>
        <LocaleSwitcher />
        <button data-testid="outside">Outside</button>
      </div>,
      { wrapper }
    )
    fireEvent.click(screen.getByRole('button', { name: /switch language/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
