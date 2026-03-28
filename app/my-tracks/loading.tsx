export default function MyTracksLoading() {
  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)]">
      <div className="ambient-content max-w-2xl mx-auto px-5 py-12">
        <div className="mb-10 h-4 w-20 bg-white/5 rounded animate-pulse" />
        <div className="mb-10">
          <div className="h-3 w-32 bg-white/5 rounded animate-pulse mb-3" />
          <div className="h-10 w-48 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-5 animate-pulse"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-6 w-16 bg-white/5 rounded-full" />
                <div className="h-3 w-12 bg-white/5 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
