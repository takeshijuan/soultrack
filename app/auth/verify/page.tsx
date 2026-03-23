import Link from "next/link"

export default function VerifyPage() {
  return (
    <main className="ambient-bg min-h-screen text-[var(--text-primary)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">✉️</div>
        <h1 className="text-xl font-bold text-white mb-2">メールを確認してください</h1>
        <p className="text-[var(--text-muted)] text-sm">
          ログインリンクを送信しました。<br />
          メールのリンクをクリックしてログインできます。
        </p>
        <p className="text-[var(--text-muted)] text-xs mt-4">
          メールが届かない場合はスパムフォルダを確認してください。
        </p>
        <Link
          href="/auth/signin"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mt-4 inline-block transition-colors"
        >
          ← メールアドレスを変更する
        </Link>
      </div>
    </main>
  )
}
