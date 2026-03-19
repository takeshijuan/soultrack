import Link from 'next/link'

export default function Home() {
  return (
    <main className="ambient-bg min-h-screen flex flex-col items-center justify-center px-6">
      <div className="ambient-content text-center w-full max-w-2xl mx-auto">

        {/* Eyebrow */}
        <p className="text-xs tracking-[0.3em] text-[var(--text-muted)] uppercase mb-8 font-medium">
          AI · Music · Daily Ritual
        </p>

        {/* Hero title */}
        <h1
          className="font-display font-bold leading-[0.88] tracking-tight text-[var(--text-primary)] mb-8"
          style={{ fontSize: 'clamp(5rem, 16vw, 10rem)' }}
        >
          SOUL<br />TRACK
        </h1>

        {/* Tagline */}
        <p className="text-[var(--text-muted)] text-xl font-light mb-14 tracking-wide">
          the music of your moment
        </p>

        {/* CTA */}
        <Link
          href="/create"
          className="group inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-base
                     bg-[var(--accent-teal)] text-black
                     transition-all duration-300
                     hover:bg-white hover:shadow-[0_0_50px_rgba(0,245,212,0.5)]"
        >
          <span>Generate Today&apos;s Track</span>
          <span className="group-hover:translate-x-1.5 transition-transform duration-200 text-lg">→</span>
        </Link>

        {/* Hint */}
        <p className="mt-6 text-[var(--text-muted)] text-sm tracking-widest">
          3 questions &nbsp;·&nbsp; 1 melody &nbsp;·&nbsp; yours
        </p>
      </div>

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
    </main>
  )
}
