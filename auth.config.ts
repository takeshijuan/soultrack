import Resend from "next-auth/providers/resend"
import type { NextAuthConfig } from "next-auth"

export default {
  providers: [
    Resend({ from: "Soultrack <noreply@soultrack.app>" }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
} satisfies NextAuthConfig
