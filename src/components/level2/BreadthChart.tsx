import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { GlassCard } from '../ui/GlassCard'
import { SectionHeader } from '../ui/SectionHeader'
import type { BreadthDay } from '../../types/market'

const chartTooltipStyle = {
  background: 'rgba(12, 12, 20, 0.96)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
  padding: '8px 12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
}

const tickStyle = { fill: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'var(--font-mono)' }

export function BreadthSection({ data }: { data: BreadthDay[] }) {
  return (
    <div>
      <SectionHeader icon="📊" title="시장 폭 분석" subtitle="Breadth" delay={0.28} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard delay={0.3}>
          <div className="flex items-center justify-between mb-4" style={{ marginBottom: 16 }}>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)]">20일선 위 종목 비율</h3>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{data.length}일</span>
          </div>
          <div className="w-full" style={{ height: 280, minHeight: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
                <defs>
                  <linearGradient id="breadthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#42a5f5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#42a5f5" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={8} />
                <YAxis domain={[0, 100]} tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={40} />
                <ReferenceLine y={50} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <ReferenceLine y={70} stroke="rgba(255,23,68,0.2)" strokeDasharray="3 3" label={{ value: '과열', position: 'right', fill: 'rgba(255,23,68,0.35)', fontSize: 9 }} />
                <ReferenceLine y={30} stroke="rgba(0,230,118,0.2)" strokeDasharray="3 3" label={{ value: '침체', position: 'right', fill: 'rgba(0,230,118,0.35)', fontSize: 9 }} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
                <Area type="monotone" dataKey="aboveMa20Pct" stroke="#42a5f5" fill="url(#breadthGrad)" strokeWidth={2} name="20MA 위 비율(%)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.34}>
          <div className="flex items-center justify-between mb-4" style={{ marginBottom: 16 }}>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)]">신고가-신저가 스프레드</h3>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{data.length}일</span>
          </div>
          <div className="w-full" style={{ height: 280, minHeight: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
                <defs>
                  <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e676" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00e676" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={tickStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" dy={8} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={40} domain={[(min: number) => Math.floor(min - 20), (max: number) => Math.ceil(max + 20)]} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
                <Area type="monotone" dataKey="spread" stroke="#00e676" fill="url(#spreadGrad)" strokeWidth={2} name="스프레드" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
