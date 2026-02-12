import GlassCard from './GlassCard'
import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon?: ReactNode
  delay?: number
}

export default function MetricCard({ label, value, sub, color, icon, delay = 0 }: Props) {
  return (
    <GlassCard delay={delay} className="flex flex-col gap-2 min-w-[140px]">
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="font-mono text-2xl font-bold" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && <div className="text-xs text-[var(--text-secondary)]">{sub}</div>}
    </GlassCard>
  )
}
