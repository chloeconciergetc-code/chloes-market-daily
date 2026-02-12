import { Card } from './Card'
import type { ReactNode } from 'react'

/** @deprecated Use Card directly */
export function GlassCard({ children, className = '', delay: _delay = 0, noPad = false }: {
  children: ReactNode
  className?: string
  delay?: number
  noPad?: boolean
}) {
  return <Card className={className} noPad={noPad}>{children}</Card>
}
