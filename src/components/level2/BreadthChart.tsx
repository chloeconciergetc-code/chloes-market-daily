import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { GlassCard } from '../ui/GlassCard'
import type { BreadthDay } from '../../types/market'

export function BreadthSection({ data }: { data: BreadthDay[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <GlassCard delay={0.3}>
        <h3 className="text-sm text-[var(--text-secondary)] mb-3">📊 20일선 위 종목 비율 <span className="text-[var(--text-tertiary)]">최근 {data.length}거래일</span></h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="breadthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-ma20)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-ma20)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            <ReferenceLine y={70} stroke="var(--color-down)" strokeDasharray="3 3" opacity={0.3} />
            <ReferenceLine y={30} stroke="var(--color-up)" strokeDasharray="3 3" opacity={0.3} />
            <Tooltip contentStyle={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="aboveMa20Pct" stroke="var(--color-ma20)" fill="url(#breadthGrad)" strokeWidth={2} name="20MA 위 비율(%)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard delay={0.35}>
        <h3 className="text-sm text-[var(--text-secondary)] mb-3">📈 신고가-신저가 스프레드 <span className="text-[var(--text-tertiary)]">최근 {data.length}거래일</span></h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-up)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-up)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
            <Tooltip contentStyle={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="spread" stroke="var(--color-up)" fill="url(#spreadGrad)" strokeWidth={2} name="스프레드 (신고가-신저가)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  )
}
