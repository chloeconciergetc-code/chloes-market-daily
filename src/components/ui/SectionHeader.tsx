export function SectionHeader({ title, subtitle }: {
  icon?: string; title: string; subtitle?: string; delay?: number
}) {
  return (
    <div className="flex items-baseline gap-3 mb-4 pt-5">
      <div className="w-0.5 h-4 rounded-full bg-[var(--color-accent)] shrink-0 translate-y-[1px]" />
      <h2 className="font-bold text-[var(--text-primary)] tracking-tight leading-tight" style={{ fontSize: 'var(--text-headline)' }}>{title}</h2>
      {subtitle && <span className="text-[var(--text-tertiary)] font-mono" style={{ fontSize: 'var(--text-caption)' }}>{subtitle}</span>}
    </div>
  )
}
