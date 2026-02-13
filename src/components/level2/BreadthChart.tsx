import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { ChartContainer } from '../ui/ChartContainer'
import { SectionHeader } from '../ui/SectionHeader'
import type { BreadthDay } from '../../types/market'

const tooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  fontSize: 12,
  fontFamily: 'var(--font-mono)',
  padding: '8px 12px',
  boxShadow: 'var(--shadow-elevated)',
}

const tickStyle = { fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'var(--font-mono)' }

export function BreadthSection({ data }: { data: BreadthDay[] }) {
  return (
    <div>
      <SectionHeader title="시장 폭 분석" subtitle="Breadth" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer title="20일선 위 종목 비율" subtitle={`${data.length}일`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
              <defs>
                <linearGradient id="breadthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={d => d.slice(5, 7) + '.' + d.slice(8, 10)} tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={8} />
              <YAxis domain={[0, 100]} tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={38} />
              <ReferenceLine y={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <ReferenceLine y={70} stroke="rgba(239,68,68,0.15)" strokeDasharray="3 3" label={{ value: '과열', position: 'right', fill: 'rgba(239,68,68,0.4)', fontSize: 9 }} />
              <ReferenceLine y={30} stroke="rgba(34,197,94,0.15)" strokeDasharray="3 3" label={{ value: '침체', position: 'right', fill: 'rgba(34,197,94,0.4)', fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
              <Area type="monotone" dataKey="aboveMa20Pct" stroke="var(--chart-1)" fill="url(#breadthGrad)" strokeWidth={1.5} name="20MA 위 비율(%)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="신고가-신저가 스프레드" subtitle={`${data.length}일`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
              <defs>
                <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-up)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--color-up)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" tickFormatter={d => d.slice(5, 7) + '.' + d.slice(8, 10)} tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={8} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={38} domain={[(min: number) => Math.floor(min - 20), (max: number) => Math.ceil(max + 20)]} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
              <Area type="monotone" dataKey="spread" stroke="var(--color-up)" fill="url(#spreadGrad)" strokeWidth={1.5} name="스프레드" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
