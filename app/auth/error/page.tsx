import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold text-white mb-2">ログインに失敗しました</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          リンクの有効期限が切れているか、無効なリンクです。
        </p>
        <Link
          href="/auth/signin"
          className="text-sm px-5 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
        >
          もう一度ログインする
        </Link>
      </div>
    </main>
  )
}
