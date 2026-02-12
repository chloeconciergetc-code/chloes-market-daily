import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface Stock {
  ticker: string
  name: string
  close: number
  changePct: number
  volume: number
}

export function HighStocksList({ stocks }: { stocks: Stock[] }) {
  const top = stocks.slice(0, 20)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="glass p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Star size={18} className="text-amber-400" />
        <h2 className="text-lg font-semibold">52주 신고가 종목</h2>
        <span className="text-xs text-white/30 ml-auto">총 {stocks.length}종목</span>
      </div>
      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 text-xs text-white/30 px-3 pb-2 border-b border-white/5">
          <span className="col-span-5">종목명</span>
          <span className="col-span-3 text-right">종가</span>
          <span className="col-span-2 text-right">등락률</span>
          <span className="col-span-2 text-right hidden sm:block">거래량</span>
        </div>
        {top.map((s, i) => (
          <motion.div
            key={s.ticker}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.03 }}
            className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="col-span-5 flex items-center gap-2">
              <span className="text-[10px] text-white/20 w-5">{i + 1}</span>
              <div>
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-[10px] text-white/20">{s.ticker}</p>
              </div>
            </div>
            <div className="col-span-3 text-right text-sm tabular-nums">
              {s.close >= 10000
                ? `${(s.close / 10000).toFixed(s.close >= 100000 ? 1 : 2)}만`
                : s.close.toLocaleString()}
            </div>
            <div className={`col-span-2 text-right text-sm font-medium tabular-nums ${s.changePct > 0 ? 'text-emerald-400' : s.changePct < 0 ? 'text-red-400' : 'text-white/40'}`}>
              {s.changePct > 0 ? '+' : ''}{s.changePct.toFixed(1)}%
            </div>
            <div className="col-span-2 text-right text-xs text-white/30 hidden sm:block tabular-nums">
              {s.volume >= 1000000
                ? `${(s.volume / 1000000).toFixed(1)}M`
                : s.volume >= 1000
                ? `${(s.volume / 1000).toFixed(0)}K`
                : s.volume}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
