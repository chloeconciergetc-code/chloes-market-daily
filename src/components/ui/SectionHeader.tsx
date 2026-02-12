import { motion } from 'framer-motion'

export function SectionHeader({ icon, title, subtitle, delay = 0 }: {
  icon: string; title: string; subtitle?: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-baseline gap-2.5 mb-5"
    >
      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent)]/30 translate-y-[1px]" />
      <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{title}</h2>
      {subtitle && <span className="text-[11px] text-[var(--text-muted)] font-mono">{subtitle}</span>}
    </motion.div>
  )
}
