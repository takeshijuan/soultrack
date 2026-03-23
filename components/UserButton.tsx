import { auth, signOut } from "@/auth"
import Link from "next/link"

export default async function UserButton() {
  const session = await auth()

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/my-tracks"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          マイトラック
        </Link>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            ログアウト
          </button>
        </form>
      </div>
    )
  }

  return (
    <Link
      href="/auth/signin"
      className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
    >
      ログイン
    </Link>
  )
}
