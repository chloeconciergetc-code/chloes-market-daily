import { useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { fmtDateLabel } from '../../lib/format'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import type { InvestorFlowData, InvestorFlowDay } from '../../types/market'

type Market = 'kospi' | 'kosdaq'

const colors = {
  foreign: 'var(--chart-1)',
  institution: 'var(--chart-2)',
  individual: 'var(--chart-3)',
}

function BarChart({ data, width = 600, height = 220 }: { data: InvestorFlowDay[]; width?: number; height?: number }) {
  if (!data.length) return null
  const margin = { top: 16, right: 8, left: 56, bottom: 24 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const allVals = data.flatMap(d => [d.foreign, d.institution, d.individual])
  const absMax = Math.max(...allVals.map(Math.abs), 1)
  const yScale = scaleLinear().domain([-absMax, absMax]).range([innerH, 0])
  const barGroupW = innerW / data.length
  const barW = Math.max(2, barGroupW * 0.22)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Zero line */}
      <line x1={margin.left} x2={width - margin.right} y1={margin.top + yScale(0)} y2={margin.top + yScale(0)}
        stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

      {/* Y-axis labels */}
      {[-absMax, -absMax / 2, 0, absMax / 2, absMax].map((v, i) => (
        <text key={i} x={margin.left - 4} y={margin.top + yScale(v) + 3}
          fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-mono)" textAnchor="end">
          {(v / 10000).toFixed(v === 0 ? 0 : 1)}조
        </text>
      ))}

      {data.map((d, i) => {
        const x = margin.left + i * barGroupW + barGroupW * 0.15
        const zero = yScale(0) + margin.top
        const labelInterval = Math.max(1, Math.ceil(data.length / 5))
        const showLabel = i % labelInterval === 0 || i === data.length - 1

        const drawBar = (val: number, offset: number, color: string) => {
          const h = Math.abs(yScale(0) - yScale(val))
          const y = val >= 0 ? zero - h : zero
          return <rect key={offset} x={x + offset * (barW + 2)} y={y} width={barW} height={Math.max(h, 1)} fill={color} opacity={0.8} rx={1.5} />
        }

        return (
          <g key={d.date}>
            {drawBar(d.foreign, 0, colors.foreign)}
            {drawBar(d.institution, 1, colors.institution)}
            {drawBar(d.individual, 2, colors.individual)}
            {showLabel && (
              <text x={x + barGroupW * 0.35} y={height - 4}
                fill="rgba(255,255,255,0.4)" fontSize={10} fontFamily="var(--font-mono)" textAnchor="middle">
                {fmtDateLabel(d.date)}
              </text>
            )}
          </g>
        )
      })}

      {/* Legend */}
      <g transform={`translate(${margin.left + 2}, 10)`}>
        {[['외국인', colors.foreign], ['기관', colors.institution], ['개인', colors.individual]].map(([label, c], i) => (
          <g key={i} transform={`translate(${i * 60}, 0)`}>
            <rect x={0} y={-4} width={8} height={8} fill={c as string} rx={2} />
            <text x={12} y={4} fill="var(--text-secondary)" fontSize={10}>{label}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

function FlowCard({ label, today, cumulative, color }: {
  label: string; today: number; cumulative: number; color: string
}) {
  const fmt = (v: number) => {
    const sign = v >= 0 ? '+' : ''
    if (Math.abs(v) >= 10000) return `${sign}${(v / 10000).toFixed(1)}조`
    return `${sign}${v.toLocaleString()}억`
  }
  const cls = (v: number) => v >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'

  return (
    <div className="relative p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-default)] overflow-hidden">
      {/* Color accent bar */}
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: color }} />
      <div className="text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mb-2" style={{ fontSize: 'var(--text-micro)' }}>{label}</div>
      <div className={`font-mono font-bold ${cls(today)}`} style={{ fontSize: 'var(--text-headline)' }}>{fmt(today)}</div>
      <div className="text-[var(--text-muted)] mt-1" style={{ fontSize: 'var(--text-caption)' }}>
        5일 누적 <span className={`font-mono font-semibold ${cls(cumulative)}`}>{fmt(cumulative)}</span>
      </div>
    </div>
  )
}

export function InvestorFlow({ data }: { data: InvestorFlowData }) {
  const [market, setMarket] = useState<Market>('kospi')
  const flows = market === 'kospi' ? data.kospi : data.kosdaq
  const latest = flows[flows.length - 1]

  const cum5 = flows.slice(-5).reduce((acc, d) => ({
    foreign: acc.foreign + d.foreign,
    institution: acc.institution + d.institution,
    individual: acc.individual + d.individual,
  }), { foreign: 0, institution: 0, individual: 0 })

  return (
    <div>
      <SectionHeader title="투자자별 매매동향" subtitle="Investor Flow" />
      <Card>
        {/* Market toggle */}
        <div className="flex items-center gap-1 mb-5">
          {(['kospi', 'kosdaq'] as Market[]).map(m => (
            <button key={m} onClick={() => setMarket(m)}
              className={`px-4 py-1.5 font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
                market === m ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
              style={{ fontSize: 'var(--text-caption)' }}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        {latest && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <FlowCard label="외국인" today={latest.foreign} cumulative={cum5.foreign} color={colors.foreign} />
            <FlowCard label="기관" today={latest.institution} cumulative={cum5.institution} color={colors.institution} />
            <FlowCard label="개인" today={latest.individual} cumulative={cum5.individual} color={colors.individual} />
          </div>
        )}

        {/* Chart */}
        <BarChart data={flows} />
      </Card>
    </div>
  )
}
