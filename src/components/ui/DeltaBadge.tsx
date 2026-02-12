export function DeltaBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const color = value > 0 ? 'text-[var(--color-up)]' : value < 0 ? 'text-[var(--color-down)]' : 'text-[var(--color-flat)]'
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : ''
  return (
    <span className={`${color} font-mono text-sm`}>
      {arrow} {Math.abs(value).toFixed(2)}{suffix}
    </span>
  )
}
