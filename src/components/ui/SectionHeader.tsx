import { motion } from 'framer-motion'

export function SectionHeader({ icon, title, subtitle, delay = 0 }: {
  icon: string; title: string; subtitle?: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-2 mb-4"
    >
      <span className="text-base">{icon}</span>
      <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">{title}</h2>
      {subtitle && <span className="text-xs text-[var(--text-tertiary)] ml-1">{subtitle}</span>}
    </motion.div>
  )
}
