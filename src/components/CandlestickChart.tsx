import { scaleLinear, scaleBand } from 'd3-scale'
import type { Candle } from '../types/data'

interface Props {
  candles: Candle[]
  width?: number
  height?: number
  name?: string
}

export default function CandlestickChart({ candles, width = 600, height = 320, name }: Props) {
  if (!candles.length) return null

  const margin = { top: 24, right: 8, bottom: 24, left: 56 }
  const W = width - margin.left - margin.right
  const H = height - margin.top - margin.bottom

  const allLow = Math.min(...candles.map(c => c.l))
  const allHigh = Math.max(...candles.map(c => c.h))
  const pad = (allHigh - allLow) * 0.05

  const x = scaleBand<string>().domain(candles.map(c => c.d)).range([0, W]).padding(0.3)
  const y = scaleLinear().domain([allLow - pad, allHigh + pad]).range([H, 0])
  const bw = x.bandwidth()

  return (
    <div className="overflow-x-auto">
      {name && <div className="text-xs text-[var(--text-secondary)] mb-1 pl-1">{name}</div>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y grid */}
          {y.ticks(5).map(t => (
            <g key={t}>
              <line x1={0} x2={W} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
              <text x={-8} y={y(t)} dy="0.35em" textAnchor="end" fill="#666" fontSize={10} fontFamily="JetBrains Mono">
                {t >= 1000 ? `${(t/1000).toFixed(0)}K` : t.toLocaleString()}
              </text>
            </g>
          ))}

          {/* MA lines */}
          {(['ma20', 'ma60'] as const).map(key => {
            const color = key === 'ma20' ? 'var(--color-ma20)' : 'var(--color-ma60)'
            const pts = candles
              .filter(c => c[key] != null)
              .map(c => `${(x(c.d) ?? 0) + bw / 2},${y(c[key]!)}`)
              .join(' ')
            return pts ? <polyline key={key} fill="none" stroke={color} strokeWidth={1.2} opacity={0.7} points={pts} /> : null
          })}

          {/* Candles */}
          {candles.map(c => {
            const cx = (x(c.d) ?? 0)
            const isUp = c.c >= c.o
            const color = isUp ? 'var(--color-up)' : 'var(--color-down)'
            const bodyTop = y(Math.max(c.o, c.c))
            const bodyH = Math.max(1, Math.abs(y(c.o) - y(c.c)))
            return (
              <g key={c.d}>
                <line x1={cx + bw/2} x2={cx + bw/2} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1} />
                <rect x={cx} y={bodyTop} width={bw} height={bodyH} fill={isUp ? 'transparent' : color} stroke={color} strokeWidth={1} rx={1} />
              </g>
            )
          })}

          {/* X labels (every ~10) */}
          {candles.filter((_, i) => i % 10 === 0).map(c => (
            <text key={c.d} x={(x(c.d) ?? 0) + bw/2} y={H + 16} textAnchor="middle" fill="#555" fontSize={9} fontFamily="JetBrains Mono">
              {c.d.slice(5)}
            </text>
          ))}
        </g>

        {/* MA Legend */}
        <g transform={`translate(${margin.left + 8}, 12)`}>
          <circle cx={0} cy={0} r={3} fill="var(--color-ma20)" />
          <text x={6} y={3.5} fill="#888" fontSize={9}>MA20</text>
          <circle cx={50} cy={0} r={3} fill="var(--color-ma60)" />
          <text x={56} y={3.5} fill="#888" fontSize={9}>MA60</text>
        </g>
      </svg>
    </div>
  )
}
