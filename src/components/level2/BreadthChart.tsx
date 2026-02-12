import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import type { BreadthDay } from '../../types/market'

const chartTooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  fontSize: 13,
  fontFamily: 'var(--font-mono)',
  padding: '8px 12px',
  boxShadow: 'var(--shadow-elevated)',
}

const tickStyle = { fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)' }

export function BreadthSection({ data }: { data: BreadthDay[] }) {
  return (
    <div>
      <SectionHeader title="시장 폭 분석" subtitle="Breadth" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-body)' }}>20일선 위 종목 비율</h3>
            <span className="text-[var(--text-muted)] font-mono" style={{ fontSize: 'var(--text-label)' }}>{data.length}일</span>
          </div>
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
                <defs>
                  <linearGradient id="breadthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-blue)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--color-blue)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={8} />
                <YAxis domain={[0, 100]} tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={42} />
                <ReferenceLine y={50} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <ReferenceLine y={70} stroke="rgba(239,68,68,0.25)" strokeDasharray="3 3" label={{ value: '과열', position: 'right', fill: 'rgba(239,68,68,0.45)', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="rgba(34,197,94,0.25)" strokeDasharray="3 3" label={{ value: '침체', position: 'right', fill: 'rgba(34,197,94,0.45)', fontSize: 10 }} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="aboveMa20Pct" stroke="var(--color-blue)" fill="url(#breadthGrad)" strokeWidth={2} name="20MA 위 비율(%)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-body)' }}>신고가-신저가 스프레드</h3>
            <span className="text-[var(--text-muted)] font-mono" style={{ fontSize: 'var(--text-label)' }}>{data.length}일</span>
          </div>
          <div className="w-full" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
                <defs>
                  <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-up)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--color-up)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={8} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={42} domain={[(min: number) => Math.floor(min - 20), (max: number) => Math.ceil(max + 20)]} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="spread" stroke="var(--color-up)" fill="url(#spreadGrad)" strokeWidth={2} name="스프레드" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
