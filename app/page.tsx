import Link from 'next/link'
import EmotionShowcase from '@/components/EmotionShowcase'
import WaitlistForm from '@/components/WaitlistForm'
import HeroContent from '@/components/HeroContent'
import ScrollReveal from '@/components/ScrollReveal'
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const t = await getTranslations('lp')

  return (
    <main className="ambient-bg flex flex-col items-center px-6">
      {/* Hero — independent min-h-screen section so justify-center works correctly */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center relative">
        <HeroContent />

        {/* Scroll indicator — absolute bottom-8 correctly anchored to hero section */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--text-muted)] animate-bounce"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/* Floating ambient particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {[
          { size: 3,   top: '18%', left: '12%',  color: 'var(--accent-teal)',  delay: '0s',    dur: '4s'   },
          { size: 4,   top: '65%', right: '18%', color: 'var(--accent-amber)', delay: '1s',    dur: '5s'   },
          { size: 2,   top: '38%', left: '82%',  color: '#F0F0F8',             delay: '2s',    dur: '6s'   },
          { size: 5,   top: '78%', left: '28%',  color: 'var(--accent-teal)',  delay: '0.5s',  dur: '7s'   },
          { size: 2.5, top: '12%', right: '32%', color: 'var(--accent-amber)', delay: '1.5s',  dur: '4.5s' },
          { size: 3.5, top: '50%', left: '6%',   color: 'var(--accent-teal)',  delay: '3s',    dur: '5.5s' },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-40"
            style={{
              width:    p.size,
              height:   p.size,
              top:      p.top,
              left:     'left' in p ? (p as { left: string }).left : undefined,
              right:    'right' in p ? (p as { right: string }).right : undefined,
              background: p.color,
              animation: `float ${p.dur} ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Interactive emotion demo */}
      <EmotionShowcase />

      {/* Waitlist capture — early access */}
      <section className="w-full max-w-xl mx-auto px-6 pb-16 text-center">
        {/* Subtle gradient separator from EmotionShowcase */}
        <div
          className="w-24 h-px mx-auto mb-10"
          style={{ background: 'linear-gradient(90deg, transparent, var(--border-hover), transparent)' }}
          aria-hidden="true"
        />
        <ScrollReveal delay={0.1}>
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3 transition-colors duration-[800ms]"
            style={{ color: 'var(--emotion-hue, #00F5D4)' }}
          >
            Early Access
          </p>
          <p className="text-[var(--text-muted)] text-sm mb-8 font-light tracking-wide">
            Your emotions. Your soundtrack. First to know.
          </p>
          <WaitlistForm />
        </ScrollReveal>
      </section>

      {/* Footer CTA */}
      <section className="w-full max-w-xl mx-auto px-6 pb-24 text-center">
        <ScrollReveal>
          <Link
            href="/create"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-base
                       bg-[var(--accent-teal)] text-black
                       transition-all duration-300
                       hover:bg-white hover:shadow-[0_0_50px_rgba(0,245,212,0.5)]"
          >
            <span>{t('footerCta')}</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-200 text-lg">→</span>
          </Link>
          <p className="mt-4 text-[var(--text-muted)] text-xs tracking-widest">{t('footerNote')}</p>
        </ScrollReveal>
      </section>
    </main>

  )
}
