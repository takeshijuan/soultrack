export default function LegalSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold mb-3 text-white/90">{title}</h2>
      <p className="text-white/70 leading-relaxed whitespace-pre-line text-sm">{body}</p>
    </section>
  )
}
