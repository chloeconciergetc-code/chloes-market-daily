import { useState } from 'react'
import { scaleLinear } from 'd3-scale'
import type { IndexChartData } from '../../types/market'

interface Props {
  data: IndexChartData
  label: string
  width?: number
  height?: number
}

export function IndexCandlestickChart({ data, label, width = 600, height = 320 }: Props) {
  const { candles, ma20, ma60 } = data
  const [showMA, setShowMA] = useState(true)
  if (!candles.length) return null

  const chartH = height * 0.7
  const volH = height * 0.18
  const gap = height * 0.04
  const margin = { top: 20, right: 56, left: 8, bottom: 4 }
  const innerW = width - margin.left - margin.right

  const xScale = scaleLinear().domain([0, candles.length - 1]).range([margin.left, width - margin.right])
  const yMin = Math.min(...candles.map(c => c.l)) * 0.997
  const yMax = Math.max(...candles.map(c => c.h)) * 1.003
  const yScale = scaleLinear().domain([yMin, yMax]).range([chartH, margin.top])
  const sortedVols = candles.map(c => c.v).sort((a, b) => a - b)
  const vMax = sortedVols[Math.floor(sortedVols.length * 0.95)] || 1
  const vScale = scaleLinear().domain([0, vMax]).range([0, volH]).clamp(true)

  const candleW = Math.max(2, innerW / candles.length * 0.6)

  const makePath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ')

  const lastCandle = candles[candles.length - 1]
  const prevCandle = candles.length > 1 ? candles[candles.length - 2] : lastCandle
  const dayChange = lastCandle.c - prevCandle.c
  const dayChangePct = prevCandle.c ? ((dayChange / prevCandle.c) * 100) : 0
  const isUp = dayChange >= 0

  const yTicks = Array.from({ length: 4 }, (_, i) => yMin + (yMax - yMin) * (i + 0.5) / 4)

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-semibold tracking-wide text-[var(--text-tertiary)] uppercase" style={{ fontSize: 'var(--text-label)' }}>{label}</span>
        <span className="font-mono font-bold tracking-tight" style={{ fontSize: '1.5rem' }}>{lastCandle.c.toLocaleString()}</span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-medium
          ${isUp ? 'bg-[var(--color-up-soft)] text-[var(--color-up)]' : 'bg-[var(--color-down-soft)] text-[var(--color-down)]'}`}
          style={{ fontSize: 'var(--text-label)' }}>
          {isUp ? '↑' : '↓'} {Math.abs(dayChange).toLocaleString()} ({dayChangePct > 0 ? '+' : ''}{dayChangePct.toFixed(2)}%)
        </span>
        <button onClick={() => setShowMA(v => !v)}
          className={`ml-auto px-2.5 py-1 font-semibold tracking-wide uppercase rounded-[var(--radius-sm)] transition-all duration-200 ${
            showMA ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)]'
          }`}
          style={{ fontSize: 'var(--text-micro)' }}>
          MA
        </button>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {yTicks.map((val, i) => {
          const y = yScale(val)
          return (
            <g key={i}>
              <line x1={margin.left} x2={width - margin.right} y1={y} y2={y}
                stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />
              <text x={width - margin.right + 6} y={y + 3.5}
                fill="var(--text-tertiary)" fontSize={10} fontFamily="var(--font-mono)">
                {val.toFixed(0)}
              </text>
            </g>
          )
        })}

        {showMA && <>
          <path d={makePath(ma20)} fill="none" stroke="var(--color-blue)" strokeWidth={1.5} opacity={0.7} strokeLinecap="round" />
          <path d={makePath(ma60)} fill="none" stroke="var(--color-orange)" strokeWidth={1.5} opacity={0.7} strokeLinecap="round" />
        </>}

        {candles.map((c, i) => {
          const up = c.c >= c.o
          const color = up ? 'var(--color-up)' : 'var(--color-down)'
          const x = xScale(i)
          const bodyTop = yScale(Math.max(c.o, c.c))
          const bodyBot = yScale(Math.min(c.o, c.c))
          const bodyH = Math.max(1, bodyBot - bodyTop)

          return (
            <g key={c.d}>
              <line x1={x} x2={x} y1={yScale(c.h)} y2={yScale(c.l)} stroke={color} strokeWidth={0.8} opacity={0.7} />
              <rect x={x - candleW / 2} y={bodyTop} width={candleW} height={bodyH}
                fill={up ? 'transparent' : color} stroke={color} strokeWidth={0.8} rx={0.5} />
            </g>
          )
        })}

        {candles.map((c, i) => {
          const up = c.c >= c.o
          return (
            <rect key={`v-${i}`}
              x={xScale(i) - candleW / 2}
              y={chartH + gap + volH - vScale(c.v)}
              width={candleW}
              height={Math.max(0, vScale(c.v))}
              fill={up ? 'var(--color-up)' : 'var(--color-down)'}
              opacity={0.2}
              rx={0.5}
            />
          )
        })}

        <g>
          <rect x={width - margin.right + 1} y={yScale(lastCandle.c) - 9} width={52} height={18} rx={4}
            fill={isUp ? 'var(--color-up)' : 'var(--color-down)'} />
          <text x={width - margin.right + 27} y={yScale(lastCandle.c) + 3.5}
            fill="white" fontSize={9} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600">
            {lastCandle.c.toLocaleString()}
          </text>
          <line x1={xScale(candles.length - 1)} x2={width - margin.right + 1}
            y1={yScale(lastCandle.c)} y2={yScale(lastCandle.c)}
            stroke={isUp ? 'var(--color-up)' : 'var(--color-down)'}
            strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
        </g>

        {showMA && (
          <g transform={`translate(${margin.left + 2}, ${margin.top - 6})`}>
            <rect x={-2} y={-6} width={100} height={14} rx={4} fill="rgba(0,0,0,0.4)" />
            <line x1={2} x2={14} y1={0} y2={0} stroke="var(--color-blue)" strokeWidth={1.5} strokeLinecap="round" />
            <text x={18} y={3} fill="var(--text-tertiary)" fontSize={9} fontFamily="var(--font-mono)">MA20</text>
            <line x1={50} x2={62} y1={0} y2={0} stroke="var(--color-orange)" strokeWidth={1.5} strokeLinecap="round" />
            <text x={66} y={3} fill="var(--text-tertiary)" fontSize={9} fontFamily="var(--font-mono)">MA60</text>
          </g>
        )}
      </svg>
    </div>
  )
}
