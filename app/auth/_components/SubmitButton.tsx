"use client"
import { useFormStatus } from "react-dom"
import { useTranslations } from "next-intl"

export default function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useTranslations("auth")

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl font-display font-semibold text-sm text-black bg-[#00F5D4] transition-all hover:shadow-[0_0_20px_rgba(0,245,212,0.4)] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            aria-hidden="true"
            className="animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          {t("submitLoading")}
        </>
      ) : t("submitButton")}
    </button>
  )
}
