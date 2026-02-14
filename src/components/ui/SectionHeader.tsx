export function SectionHeader({ title, subtitle }: {
  icon?: string; title: string; subtitle?: string; delay?: number
}) {
  return (
    <div className="flex items-center gap-3 mb-5 pt-2">
      <div className="w-1 h-5 rounded-full bg-[var(--color-accent)] shrink-0" />
      <h2 className="font-bold text-[var(--text-primary)] tracking-tight fs-headline leading-none">{title}</h2>
      {subtitle && <span className="text-[var(--text-muted)] font-mono fs-caption leading-none">{subtitle}</span>}
    </div>
  )
}
