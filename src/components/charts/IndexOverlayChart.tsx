import { scaleLinear } from 'd3-scale'
import type { IndexChartData } from '../../types/market'

interface Props {
  kospi: IndexChartData
  kosdaq: IndexChartData
  width?: number
  height?: number
}

export function IndexOverlayChart({ kospi, kosdaq, width = 600, height = 280 }: Props) {
  const margin = { top: 20, right: 56, left: 8, bottom: 20 }

  // Normalize both to base 100
  const normalize = (candles: typeof kospi.candles) => {
    if (!candles.length) return []
    const base = candles[0].c
    return candles.map(c => ({ ...c, norm: (c.c / base) * 100 }))
  }

  const kospiN = normalize(kospi.candles)
  const kosdaqN = normalize(kosdaq.candles)
  const len = Math.min(kospiN.length, kosdaqN.length)
  if (!len) return null

  const allVals = [...kospiN.slice(0, len).map(c => c.norm), ...kosdaqN.slice(0, len).map(c => c.norm)]
  const yMin = Math.min(...allVals) * 0.99
  const yMax = Math.max(...allVals) * 1.01

  const xScale = scaleLinear().domain([0, len - 1]).range([margin.left, width - margin.right])
  const yScale = scaleLinear().domain([yMin, yMax]).range([height - margin.bottom, margin.top])

  const makePath = (data: { norm: number }[]) =>
    data.slice(0, len).map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.norm).toFixed(1)}`).join(' ')

  // Spread (KOSPI - KOSDAQ) area
  const spread = kospiN.slice(0, len).map((k, i) => k.norm - kosdaqN[i].norm)

  const lastKospi = kospiN[len - 1]
  const lastKosdaq = kosdaqN[len - 1]

  // Y ticks
  const yTicks = Array.from({ length: 4 }, (_, i) => yMin + (yMax - yMin) * (i + 0.5) / 4)

  // Date labels
  const dateLabels = kospiN.slice(0, len)
    .map((c, i) => ({ i, label: c.date.slice(5, 7) + '/' + c.date.slice(8, 10) }))
    .filter((_, i) => i % Math.max(1, Math.floor(len / 6)) === 0)

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-xs font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">KOSPI vs KOSDAQ</span>
        <span className="text-[10px] text-[var(--text-muted)]">기간 시작일 = 100 기준</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {yTicks.map((val, i) => (
          <g key={i}>
            <line x1={margin.left} x2={width - margin.right} y1={yScale(val)} y2={yScale(val)}
              stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
            <text x={width - margin.right + 4} y={yScale(val) + 3}
              fill="var(--text-tertiary)" fontSize={9} fontFamily="var(--font-mono)" opacity={0.5}>
              {val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* 100 baseline */}
        <line x1={margin.left} x2={width - margin.right} y1={yScale(100)} y2={yScale(100)}
          stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 4" />

        {/* KOSPI */}
        <path d={makePath(kospiN)} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />
        {/* KOSDAQ */}
        <path d={makePath(kosdaqN)} fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" />

        {/* Date labels */}
        {dateLabels.map(({ i, label }) => (
          <text key={i} x={xScale(i)} y={height - 4}
            fill="var(--text-tertiary)" fontSize={8} fontFamily="var(--font-mono)" textAnchor="middle">{label}</text>
        ))}

        {/* End labels */}
        <g>
          <circle cx={xScale(len - 1)} cy={yScale(lastKospi.norm)} r={3} fill="#3b82f6" />
          <text x={width - margin.right + 4} y={yScale(lastKospi.norm) - 12}
            fill="#3b82f6" fontSize={10} fontFamily="var(--font-mono)" fontWeight="600">
            KOSPI {lastKospi.norm.toFixed(1)}
          </text>
        </g>
        <g>
          <circle cx={xScale(len - 1)} cy={yScale(lastKosdaq.norm)} r={3} fill="#f97316" />
          <text x={width - margin.right + 4} y={yScale(lastKosdaq.norm) + 16}
            fill="#f97316" fontSize={10} fontFamily="var(--font-mono)" fontWeight="600">
            KOSDAQ {lastKosdaq.norm.toFixed(1)}
          </text>
        </g>

        {/* Legend */}
        <g transform={`translate(${margin.left + 4}, ${margin.top - 4})`}>
          <rect x={-4} y={-8} width={130} height={16} rx={4} fill="rgba(0,0,0,0.3)" />
          <line x1={0} x2={14} y1={0} y2={0} stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />
          <text x={18} y={3} fill="var(--text-secondary)" fontSize={9}>KOSPI</text>
          <line x1={60} x2={74} y1={0} y2={0} stroke="#f97316" strokeWidth={2} strokeLinecap="round" />
          <text x={78} y={3} fill="var(--text-secondary)" fontSize={9}>KOSDAQ</text>
        </g>
      </svg>

      {/* Spread summary */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
        <span>KOSPI {lastKospi.norm >= 100 ? '+' : ''}{(lastKospi.norm - 100).toFixed(1)}%</span>
        <span className="text-[var(--text-tertiary)]">|</span>
        <span>KOSDAQ {lastKosdaq.norm >= 100 ? '+' : ''}{(lastKosdaq.norm - 100).toFixed(1)}%</span>
        <span className="text-[var(--text-tertiary)]">|</span>
        <span>스프레드 {(lastKospi.norm - lastKosdaq.norm) >= 0 ? '+' : ''}{(lastKospi.norm - lastKosdaq.norm).toFixed(1)}p</span>
      </div>
    </div>
  )
}
