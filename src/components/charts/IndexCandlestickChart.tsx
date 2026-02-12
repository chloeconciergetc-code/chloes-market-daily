import { scaleLinear } from 'd3-scale'
import { motion } from 'framer-motion'
import type { IndexChartData } from '../../types/market'

interface Props {
  data: IndexChartData
  label: string
  width?: number
  height?: number
}

export function IndexCandlestickChart({ data, label, width = 600, height = 300 }: Props) {
  const { candles, ma20, ma60 } = data
  if (!candles.length) return null

  const chartH = height * 0.72
  const volH = height * 0.2
  const gap = height * 0.03
  const margin = { top: 12, right: 50, left: 8 }

  const xScale = scaleLinear().domain([0, candles.length - 1]).range([margin.left, width - margin.right])
  const yMin = Math.min(...candles.map(c => c.l)) * 0.998
  const yMax = Math.max(...candles.map(c => c.h)) * 1.002
  const yScale = scaleLinear().domain([yMin, yMax]).range([chartH, margin.top])
  const vMax = Math.max(...candles.map(c => c.v))
  const vScale = scaleLinear().domain([0, vMax]).range([0, volH])

  const candleW = Math.max(2, (width - margin.left - margin.right) / candles.length * 0.65)

  const makePath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(v)}`).join(' ')

  const lastCandle = candles[candles.length - 1]
  const prevCandle = candles.length > 1 ? candles[candles.length - 2] : lastCandle
  const dayChange = lastCandle.c - prevCandle.c
  const dayChangePct = prevCandle.c ? ((dayChange / prevCandle.c) * 100) : 0
  const isUp = dayChange >= 0

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-[var(--text-secondary)] text-sm">{label}</span>
        <span className="font-mono text-xl font-semibold">{lastCandle.c.toLocaleString()}</span>
        <span className={`font-mono text-sm ${isUp ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(dayChange).toLocaleString()} ({dayChangePct > 0 ? '+' : ''}{dayChangePct.toFixed(2)}%)
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(pct => {
          const y = margin.top + (chartH - margin.top) * pct
          return <line key={pct} x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" />
        })}

        {/* MA lines */}
        <path d={makePath(ma20)} fill="none" stroke="var(--color-ma20)" strokeWidth={1.2} opacity={0.7} />
        <path d={makePath(ma60)} fill="none" stroke="var(--color-ma60)" strokeWidth={1.2} opacity={0.7} />

        {/* Candles */}
        {candles.map((c, i) => {
          const up = c.c >= c.o
          const color = up ? 'var(--color-up)' : 'var(--color-down)'
          const x = xScale(i)
          const bodyTop = yScale(Math.max(c.o, c.c))
          const bodyBot = yScale(Math.min(c.o, c.c))
          const bodyH = Math.max(1, bodyBot - bodyTop)

          return (
            <motion.g key={c.d}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.008, duration: 0.3 }}>
              <line x1={x} x2={x} y1={yScale(c.h)} y2={yScale(c.l)} stroke={color} strokeWidth={1} />
              <rect x={x - candleW / 2} y={bodyTop} width={candleW} height={bodyH}
                fill={up ? 'transparent' : color} stroke={color} strokeWidth={1} rx={0.5} />
            </motion.g>
          )
        })}

        {/* Volume bars */}
        {candles.map((c, i) => {
          const up = c.c >= c.o
          return (
            <rect key={`v-${i}`}
              x={xScale(i) - candleW / 2}
              y={chartH + gap + volH - vScale(c.v)}
              width={candleW} height={Math.max(0, vScale(c.v))}
              fill={up ? 'var(--color-up)' : 'var(--color-down)'} opacity={0.3} />
          )
        })}

        {/* Latest price label */}
        <rect x={width - margin.right + 2} y={yScale(lastCandle.c) - 10} width={46} height={20} rx={4}
          fill={isUp ? 'var(--color-up)' : 'var(--color-down)'} opacity={0.9} />
        <text x={width - margin.right + 25} y={yScale(lastCandle.c) + 4}
          fill="white" fontSize={10} textAnchor="middle" fontFamily="var(--font-mono)">
          {lastCandle.c.toLocaleString()}
        </text>

        {/* MA Legend */}
        <g transform={`translate(${margin.left + 4}, ${margin.top + 2})`}>
          <line x1={0} x2={12} y1={0} y2={0} stroke="var(--color-ma20)" strokeWidth={1.5} />
          <text x={16} y={3.5} fill="var(--text-tertiary)" fontSize={9}>MA20</text>
          <line x1={52} x2={64} y1={0} y2={0} stroke="var(--color-ma60)" strokeWidth={1.5} />
          <text x={68} y={3.5} fill="var(--text-tertiary)" fontSize={9}>MA60</text>
        </g>
      </svg>
    </div>
  )
}
