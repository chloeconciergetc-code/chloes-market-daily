import { scaleLinear } from 'd3-scale'
import { fmtDateLabel } from '../../lib/format'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { AreaChart } from '../charts/AreaChart'
import { CHART } from '../../lib/chartStyles'
import type { InvestorFlowData, InvestorFlowDay, BreadthDay } from '../../types/market'

const colors = {
  foreign: CHART.colors.foreign,
  institution: CHART.colors.institution,
  individual: CHART.colors.individual,
}

/* ── Bar Chart (30 days default) ── */
function FlowBarChart({ data, label, width = 600, height = 280 }: { data: InvestorFlowDay[]; label: string; width?: number; height?: number }) {
  const sliced = data.slice(-30)
  if (!sliced.length) return null
  const margin = { top: 16, right: 8, left: 56, bottom: 28 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const allVals = sliced.flatMap(d => [d.foreign, d.institution, d.individual])
  const absMax = Math.max(...allVals.map(Math.abs), 1)
  const yScale = scaleLinear().domain([-absMax, absMax]).range([innerH, 0])
  const barGroupW = innerW / sliced.length
  const barW = Math.max(3, barGroupW * 0.25)

  const latest = sliced[sliced.length - 1]
  const cum5 = sliced.slice(-5).reduce(
    (acc, d) => ({ foreign: acc.foreign + d.foreign, institution: acc.institution + d.institution, individual: acc.individual + d.individual }),
    { foreign: 0, institution: 0, individual: 0 }
  )

  const fmt = (v: number) => {
    const sign = v >= 0 ? '+' : ''
    if (Math.abs(v) >= 10000) return `${sign}${(v / 10000).toFixed(1)}조`
    return `${sign}${v.toLocaleString()}억`
  }

  return (
    <div>
      {/* Header with label and summary */}
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <span className="font-semibold tracking-wide text-[var(--text-tertiary)] uppercase fs-caption">{label}</span>
        {latest && (
          <span className="text-[var(--text-muted)] font-mono fs-micro">
            외국인 <span className={latest.foreign >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}>{fmt(latest.foreign)}</span>
            <span className="mx-1">·</span>
            기관 <span className={latest.institution >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}>{fmt(latest.institution)}</span>
            <span className="mx-1">·</span>
            개인 <span className={latest.individual >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}>{fmt(latest.individual)}</span>
          </span>
        )}
      </div>

      {/* Flow summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <FlowCard label="외국인" today={latest?.foreign ?? 0} cumulative={cum5.foreign} color={colors.foreign} />
        <FlowCard label="기관" today={latest?.institution ?? 0} cumulative={cum5.institution} color={colors.institution} />
        <FlowCard label="개인" today={latest?.individual ?? 0} cumulative={cum5.individual} color={colors.individual} />
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <line x1={margin.left} x2={width - margin.right} y1={margin.top + yScale(0)} y2={margin.top + yScale(0)}
          stroke={CHART.refLine.stroke} strokeWidth={1} />

        {[-absMax, -absMax / 2, 0, absMax / 2, absMax].map((v, i) => (
          <text key={i} x={margin.left - 4} y={margin.top + yScale(v) + 3}
            fill={CHART.axis.fill} fontSize={CHART.axis.fontSize} fontFamily={CHART.axis.fontFamily} textAnchor="end">
            {(v / 10000).toFixed(v === 0 ? 0 : 1)}조
          </text>
        ))}

        {sliced.map((d, i) => {
          const x = margin.left + i * barGroupW + barGroupW * 0.12
          const zero = yScale(0) + margin.top
          const labelInterval = Math.max(1, Math.ceil(sliced.length / 5))
          const showLabel = i % labelInterval === 0 || i === sliced.length - 1

          const drawBar = (val: number, offset: number, color: string) => {
            const h = Math.abs(yScale(0) - yScale(val))
            const y = val >= 0 ? zero - h : zero
            return <rect key={offset} x={x + offset * (barW + 1.5)} y={y} width={barW} height={Math.max(h, 1)} fill={color} opacity={0.8} rx={1.5} />
          }

          return (
            <g key={d.date}>
              {drawBar(d.foreign, 0, colors.foreign)}
              {drawBar(d.institution, 1, colors.institution)}
              {drawBar(d.individual, 2, colors.individual)}
              {showLabel && (
                <text x={x + barGroupW * 0.35} y={height - 4}
                  fill={CHART.axis.fill} fontSize={CHART.axis.fontSize} fontFamily={CHART.axis.fontFamily} textAnchor="middle">
                  {fmtDateLabel(d.date)}
                </text>
              )}
            </g>
          )
        })}

        <g transform={`translate(${margin.left + 2}, 10)`}>
          {[['외국인', colors.foreign], ['기관', colors.institution], ['개인', colors.individual]].map(([lbl, c], i) => (
            <g key={i} transform={`translate(${i * 60}, 0)`}>
              <rect x={0} y={-4} width={8} height={8} fill={c as string} rx={2} />
              <text x={12} y={4} fill="var(--text-secondary)" fontSize={10}>{lbl}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

/* ── Flow Card ── */
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
    <div className="relative p-3.5 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-default)] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: color }} />
      <div className="text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mb-1.5 fs-micro">{label}</div>
      <div className={`font-mono font-bold ${cls(today)} fs-headline`}>{fmt(today)}</div>
      <div className="text-[var(--text-muted)] mt-1 fs-caption">
        5일 누적 <span className={`font-mono font-semibold ${cls(cumulative)}`}>{fmt(cumulative)}</span>
      </div>
    </div>
  )
}

/* ── Main Export ── */
export function FlowSection({ investorFlow, breadth }: {
  investorFlow?: InvestorFlowData
  breadth?: BreadthDay[]
}) {
  if (!investorFlow && !breadth) return null

  const breadthData = breadth?.map(d => ({ date: d.date, value: d.aboveMa20Pct })) ?? []
  const spreadData = breadth?.map(d => ({ date: d.date, value: d.spread })) ?? []

  return (
    <div className="flex flex-col" style={{ gap: 'var(--section-gap)' }}>
      {/* Investor Flow — KOSPI and KOSDAQ separately */}
      {investorFlow && (
        <div>
          <SectionHeader title="투자자별 매매동향" subtitle="Investor Flow" />
          <div className="space-y-4">
            <Card>
              <FlowBarChart data={investorFlow.kospi} label="KOSPI" />
            </Card>
            <Card>
              <FlowBarChart data={investorFlow.kosdaq} label="KOSDAQ" />
            </Card>
          </div>
        </div>
      )}

      {/* Breadth Charts — vertical layout with proper spacing */}
      {breadth && breadth.length > 0 && (
        <div>
          <SectionHeader title="시장 폭 분석" subtitle="Breadth" />
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold text-[var(--text-secondary)] mb-3 fs-body">
                20일선 위 종목 비율 <span className="text-[var(--text-muted)] font-mono fs-micro">{breadth.length}일</span>
              </h3>
              <AreaChart
                data={breadthData}
                color="var(--chart-1)"
                yDomain={[0, 100]}
                yFormat={v => `${v.toFixed(0)}%`}
                refLines={[
                  { value: 50, color: 'rgba(255,255,255,0.06)' },
                  { value: 70, label: '과열', color: 'rgba(239,68,68,0.25)' },
                  { value: 30, label: '침체', color: 'rgba(34,197,94,0.25)' },
                ]}
                height={280}
              />
            </Card>
            <Card>
              <h3 className="font-semibold text-[var(--text-secondary)] mb-3 fs-body">
                신고가-신저가 스프레드 <span className="text-[var(--text-muted)] font-mono fs-micro">{breadth.length}일</span>
              </h3>
              <AreaChart
                data={spreadData}
                color="var(--color-up)"
                yFormat={v => `${v.toFixed(0)}`}
                refLines={[{ value: 0 }]}
                height={280}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
