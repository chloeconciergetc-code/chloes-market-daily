import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { BreadthDay } from '../types/data'

export default function BreadthChart({ data }: { data: BreadthDay[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="gradBreadth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-up)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-up)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="d" tick={{ fill: '#555', fontSize: 9 }} tickFormatter={v => v.slice(5)} />
        <YAxis tick={{ fill: '#555', fontSize: 9 }} domain={[0, 100]} />
        <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
        <Tooltip
          contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
          labelFormatter={v => v}
          formatter={((val: any, name: any) => [
            `${val}${name === 'aboveMa20Pct' ? '%' : ''}`,
            name === 'aboveMa20Pct' ? 'MA20 위 비율' : name
          ]) as any}
        />
        <Area type="monotone" dataKey="aboveMa20Pct" stroke="var(--color-up)" fill="url(#gradBreadth)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
