import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function GlassCard({ children, className = '', delay = 0 }: {
  children: ReactNode; className?: string; delay?: number
}) {
  return (
    <motion.div
      className={`glass-card p-5 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
