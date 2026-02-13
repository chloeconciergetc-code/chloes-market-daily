import type { ReactNode } from 'react'
import { Card } from './Card'

export function ChartContainer({ title, subtitle, height = 260, actions, children }: {
  title: string
  subtitle?: string
  height?: number
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <h3 className="font-semibold text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-body)' }}>{title}</h3>
          {subtitle && <span className="text-[var(--text-muted)] font-mono" style={{ fontSize: 'var(--text-micro)' }}>{subtitle}</span>}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
      <div className="w-full" style={{ height }}>
        {children}
      </div>
    </Card>
  )
}
