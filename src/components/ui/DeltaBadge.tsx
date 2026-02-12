export function DeltaBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const isUp = value > 0
  const isDown = value < 0
  const bg = isUp ? 'bg-[var(--color-up-soft)]' : isDown ? 'bg-[var(--color-down-soft)]' : 'bg-white/5'
  const text = isUp ? 'text-[var(--color-up)]' : isDown ? 'text-[var(--color-down)]' : 'text-[var(--color-flat)]'
  const arrow = isUp ? '↑' : isDown ? '↓' : ''

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[var(--radius-xs)] font-mono font-semibold ${bg} ${text}`} style={{ fontSize: 'var(--text-caption)' }}>
      {arrow}{Math.abs(value).toFixed(2)}{suffix}
    </span>
  )
}
