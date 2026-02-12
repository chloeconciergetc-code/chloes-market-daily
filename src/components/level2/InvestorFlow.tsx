import { useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import type { InvestorFlowData, InvestorFlowDay } from '../../types/market'

type Market = 'kospi' | 'kosdaq'

const colors = {
  foreign: '#3b82f6',
  institution: '#a855f7',
  individual: '#f97316',
}

function BarChart({ data, width = 600, height = 220 }: { data: InvestorFlowDay[]; width?: number; height?: number }) {
  if (!data.length) return null
  const margin = { top: 16, right: 8, left: 60, bottom: 24 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const allVals = data.flatMap(d => [d.foreign, d.institution, d.individual])
  const absMax = Math.max(...allVals.map(Math.abs), 1)
  const yScale = scaleLinear().domain([-absMax, absMax]).range([innerH, 0])
  const barGroupW = innerW / data.length
  const barW = Math.max(2, barGroupW * 0.22)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <line x1={margin.left} x2={width - margin.right} y1={margin.top + yScale(0)} y2={margin.top + yScale(0)}
        stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

      {[-absMax, -absMax / 2, 0, absMax / 2, absMax].map((v, i) => (
        <text key={i} x={margin.left - 4} y={margin.top + yScale(v) + 3}
          fill="var(--text-tertiary)" fontSize={10} fontFamily="var(--font-mono)" textAnchor="end">
          {(v / 10000).toFixed(v === 0 ? 0 : 1)}조
        </text>
      ))}

      {data.map((d, i) => {
        const x = margin.left + i * barGroupW + barGroupW * 0.15
        const zero = yScale(0) + margin.top

        const drawBar = (val: number, offset: number, color: string) => {
          const h = Math.abs(yScale(0) - yScale(val))
          const y = val >= 0 ? zero - h : zero
          return <rect key={offset} x={x + offset * (barW + 2)} y={y} width={barW} height={Math.max(h, 1)} fill={color} opacity={0.75} rx={1.5} />
        }

        return (
          <g key={d.date}>
            {drawBar(d.foreign, 0, colors.foreign)}
            {drawBar(d.institution, 1, colors.institution)}
            {drawBar(d.individual, 2, colors.individual)}
            <text x={x + barGroupW * 0.35} y={height - 4}
              fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)" textAnchor="middle">
              {d.date.slice(5)}
            </text>
          </g>
        )
      })}

      <g transform={`translate(${margin.left + 2}, 10)`}>
        {[['외국인', colors.foreign], ['기관', colors.institution], ['개인', colors.individual]].map(([label, c], i) => (
          <g key={i} transform={`translate(${i * 64}, 0)`}>
            <rect x={0} y={-4} width={8} height={8} fill={c as string} rx={2} />
            <text x={12} y={4} fill="var(--text-secondary)" fontSize={10}>{label}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

function SummaryCards({ data }: { data: InvestorFlowDay[] }) {
  if (!data.length) return null
  const latest = data[data.length - 1]
  const cum5 = data.slice(-5).reduce((acc, d) => ({
    foreign: acc.foreign + d.foreign,
    institution: acc.institution + d.institution,
    individual: acc.individual + d.individual,
  }), { foreign: 0, institution: 0, individual: 0 })

  const fmt = (v: number) => {
    const sign = v >= 0 ? '+' : ''
    if (Math.abs(v) >= 10000) return `${sign}${(v / 10000).toFixed(1)}조`
    return `${sign}${v.toLocaleString()}억`
  }
  const cls = (v: number) => v >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { label: '외국인', today: latest.foreign, cum: cum5.foreign },
        { label: '기관', today: latest.institution, cum: cum5.institution },
        { label: '개인', today: latest.individual, cum: cum5.individual },
      ].map(({ label, today, cum }) => (
        <div key={label} className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-3.5 text-center">
          <div className="text-[var(--text-tertiary)] uppercase tracking-wider mb-1" style={{ fontSize: 'var(--text-label)' }}>{label}</div>
          <div className={`font-mono font-bold ${cls(today)}`} style={{ fontSize: '1.125rem' }}>{fmt(today)}</div>
          <div className="text-[var(--text-secondary)] mt-0.5" style={{ fontSize: 'var(--text-label)' }}>
            5일 누적 <span className={`font-mono font-semibold ${cls(cum)}`}>{fmt(cum)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function InvestorFlow({ data }: { data: InvestorFlowData }) {
  const [market, setMarket] = useState<Market>('kospi')
  const flows = market === 'kospi' ? data.kospi : data.kosdaq

  return (
    <div>
      <SectionHeader title="투자자별 매매동향" subtitle="Investor Flow" />
      <Card>
        <div className="flex items-center gap-2 mb-4">
          {(['kospi', 'kosdaq'] as Market[]).map(m => (
            <button key={m} onClick={() => setMarket(m)}
              className={`px-3.5 py-1.5 font-semibold rounded-[var(--radius-md)] transition-all ${
                market === m ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
              style={{ fontSize: 'var(--text-body)' }}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        <SummaryCards data={flows} />
        <BarChart data={flows} />
      </Card>
    </div>
  )
}
