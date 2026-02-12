import type { ReactNode } from 'react'

export function Card({ children, className = '', noPad = false }: {
  children: ReactNode
  className?: string
  noPad?: boolean
}) {
  return (
    <div
      className={`
        relative overflow-hidden
        rounded-[var(--radius-lg)]
        ${noPad ? '' : 'p-5 md:p-6'}
        bg-[var(--bg-card)]
        border border-[var(--border-default)]
        hover:border-[var(--border-hover)]
        transition-colors duration-200
        ${className}
      `}
    >
      {children}
    </div>
  )
}
