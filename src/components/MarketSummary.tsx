import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Minus, BarChart3, Zap } from 'lucide-react'

interface MarketData {
  advances: number
  declines: number
  unchanged: number
  tradingValue: number
  totalHighs: number
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export function MarketSummary({ data }: { data: MarketData }) {
  const cards = [
    {
      label: '상승',
      value: data.advances.toLocaleString(),
      sub: '종목',
      icon: ArrowUpRight,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: '하락',
      value: data.declines.toLocaleString(),
      sub: '종목',
      icon: ArrowDownRight,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      label: '보합',
      value: data.unchanged.toLocaleString(),
      sub: '종목',
      icon: Minus,
      color: 'text-white/50',
      bg: 'bg-white/5',
      border: 'border-white/10',
    },
    {
      label: '거래대금',
      value: (data.tradingValue / 10000).toFixed(1),
      sub: '조원',
      icon: BarChart3,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: '52주 신고가',
      value: data.totalHighs.toString(),
      sub: '종목',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
    >
      {cards.map((c) => (
        <motion.div
          key={c.label}
          variants={item}
          className={`glass p-4 sm:p-5 flex flex-col gap-3 ${c.border}`}
        >
          <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center`}>
            <c.icon size={16} className={c.color} />
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">{c.label}</p>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight">{c.value}</p>
            <p className="text-xs text-white/30">{c.sub}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
