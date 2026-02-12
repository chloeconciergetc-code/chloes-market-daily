import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function GlassCard({ children, className = '', delay = 0 }: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-[var(--bg-card)] backdrop-blur-[16px]
        border border-[var(--glass-border)]
        shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        hover:border-white/[0.15] transition-colors duration-300
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
