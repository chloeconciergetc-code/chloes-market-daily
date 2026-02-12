export function SectionHeader({ title, subtitle }: {
  icon?: string; title: string; subtitle?: string; delay?: number
}) {
  return (
    <div className="flex items-baseline gap-3 mb-5 pt-6">
      <div className="w-1 h-5 rounded-full bg-[var(--color-accent)] shrink-0 translate-y-[1px]" />
      <h2 className="text-[var(--text-headline)] font-bold text-[var(--text-primary)] tracking-tight leading-tight" style={{ fontSize: 'var(--text-headline)' }}>{title}</h2>
      {subtitle && <span className="text-[var(--text-caption)] text-[var(--text-tertiary)] font-mono" style={{ fontSize: 'var(--text-caption)' }}>{subtitle}</span>}
    </div>
  )
}
