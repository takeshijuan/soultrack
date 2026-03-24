import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your track — Soultrack',
  description:
    'Answer 3 questions and get your personalized AI-generated melody. Free, instant, yours.',
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
