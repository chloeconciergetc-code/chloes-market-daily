import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export function HeroSection({ date }: { date: string }) {
  const formatted = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center pt-8 pb-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6"
      >
        <TrendingUp size={14} />
        <span>Market Report</span>
      </motion.div>
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
        Chloe's Market Daily
      </h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-lg text-white/40"
      >
        {formatted}
      </motion.p>
    </motion.div>
  )
}
