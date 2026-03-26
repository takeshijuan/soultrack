import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center text-white bg-[#0A0A0F]">
      <div className="text-center px-6">
        <h1 className="font-display text-6xl mb-4">404</h1>
        <p className="text-white/60 mb-8">This page does not exist.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-sm"
        >
          ← Back to Soultrack
        </Link>
      </div>
    </main>
  )
}
