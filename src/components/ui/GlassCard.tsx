import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function GlassCard({ children, className = '', delay = 0, noPad = false }: {
  children: ReactNode
  className?: string
  delay?: number
  noPad?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`
        relative overflow-hidden
        rounded-[var(--radius-lg)]
        ${noPad ? '' : 'p-5 md:p-6'}
        bg-[var(--bg-card)]
        backdrop-blur-[24px]
        border border-[var(--glass-border)]
        shadow-[var(--glass-shadow)]
        hover:border-[var(--glass-border-hover)]
        transition-all duration-300 ease-out
        ${className}
      `}
    >
      {/* Top shine line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
