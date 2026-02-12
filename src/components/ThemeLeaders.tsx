import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'

interface Theme {
  name: string
  count: number
  color: string
  icon: string
  stocks: { ticker: string; name: string; highCount: number }[]
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
}

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
}

export function ThemeLeaders({ themes }: { themes: Theme[] }) {
  const maxCount = Math.max(...themes.map(t => t.count))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Layers size={18} className="text-purple-400" />
        <h2 className="text-lg font-semibold">주도 테마 TOP 10</h2>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {themes.map((t) => (
          <motion.div
            key={t.name}
            variants={item}
            className="glass p-4 relative overflow-hidden group hover:border-white/20 transition-colors"
          >
            {/* Background bar */}
            <div
              className="absolute left-0 top-0 bottom-0 opacity-10 transition-all"
              style={{
                width: `${(t.count / maxCount) * 100}%`,
                background: t.color,
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{t.icon}</span>
                  <span className="font-medium text-sm">{t.name}</span>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${t.color}22`, color: t.color }}
                >
                  {t.count}종목
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {t.stocks.map(s => (
                  <span
                    key={s.ticker}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-white/50"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
