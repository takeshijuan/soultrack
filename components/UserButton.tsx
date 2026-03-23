import { auth, signOut } from "@/auth"
import Link from "next/link"

export default async function UserButton() {
  const session = await auth()

  if (session?.user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/my-tracks"
          className="text-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
        >
          マイトラック
        </Link>
        <span className="text-white/15 text-xs select-none">|</span>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button className="text-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            ログアウト
          </button>
        </form>
      </div>
    )
  }

  return (
    <Link
      href="/auth/signin"
      className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-[var(--text-muted)] hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)] transition-all duration-200 whitespace-nowrap"
    >
      ログイン
    </Link>
  )
}
