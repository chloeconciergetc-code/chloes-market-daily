import type { ReactNode } from 'react'

type CardTier = 'ambient' | 'standard' | 'elevated'

const tierClasses: Record<CardTier, string> = {
  ambient: 'bg-transparent border border-[var(--border-default)] rounded-[var(--radius-md)]',
  standard: 'bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--border-hover)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]',
  elevated: 'bg-[var(--bg-card)] border border-[var(--border-hover)] rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)]',
}

export function Card({ children, className = '', noPad = false, tier = 'standard' }: {
  children: ReactNode
  className?: string
  noPad?: boolean
  tier?: CardTier
}) {
  return (
    <div className={`relative overflow-hidden transition-all duration-[var(--duration-normal)] ${tierClasses[tier]} ${noPad ? '' : 'p-5 md:p-6'} ${className}`}>
      {children}
    </div>
  )
}
