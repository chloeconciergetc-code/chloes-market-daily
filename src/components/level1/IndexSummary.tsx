import { motion } from 'framer-motion'
import type { IndexChartData } from '../../types/market'

interface Props {
  kospi: IndexChartData
  kosdaq: IndexChartData
}

function IndexCard({ label, data, delay }: { label: string; data: IndexChartData; delay: number }) {
  const candles = data.candles
  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2]
  if (!last || !prev) return null

  const change = last.c - prev.c
  const changePct = (change / prev.c) * 100
  const isUp = change >= 0
  const volume = last.v // 백만주

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-[200px] rounded-2xl px-5 py-4 border"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: isUp ? 'rgba(255,23,68,0.15)' : 'rgba(0,150,255,0.15)',
        boxShadow: isUp
          ? '0 0 24px rgba(255,23,68,0.06)'
          : '0 0 24px rgba(0,150,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--text-tertiary)]">{label}</span>
        <span className="text-[9px] text-[var(--text-muted)] font-mono">{last.date}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-xl md:text-2xl font-bold text-white/90 font-mono tracking-tight">
          {last.c.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-sm font-mono font-semibold ${isUp ? 'text-[#ff1744]' : 'text-[#2979ff]'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(change).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
          </span>
          <span className={`text-xs font-mono font-semibold ${isUp ? 'text-[#ff1744]' : 'text-[#2979ff]'}`}>
            ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
          </span>
        </div>
      </div>
      <div className="mt-1.5 text-[10px] text-[var(--text-muted)] font-mono">
        거래량 {volume.toFixed(0)}백만주
      </div>
    </motion.div>
  )
}

export function IndexSummary({ kospi, kosdaq }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <IndexCard label="KOSPI" data={kospi} delay={0.04} />
      <IndexCard label="KOSDAQ" data={kosdaq} delay={0.08} />
    </div>
  )
}
