import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight mb-4">
          Soultrack
        </h1>
        <p className="text-gray-400 text-lg sm:text-xl mb-20">
          the music of your moment
        </p>
        <Link
          href="/create"
          className="inline-block px-8 py-4 bg-white text-black font-semibold text-lg rounded-xl hover:bg-zinc-200 transition-colors duration-150"
        >
          Generate Today&apos;s Track →
        </Link>
      </div>
    </main>
  )
}
