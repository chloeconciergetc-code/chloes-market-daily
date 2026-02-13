import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { BreadthDay } from '../types/data'

export default function HighLowSpread({ data }: { data: BreadthDay[] }) {
  const chartData = data.map(d => ({
    d: d.d.slice(5),
    highs: d.highs,
    lows: -d.lows,
  }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis dataKey="d" tick={{ fill: '#555', fontSize: 9 }} />
        <YAxis tick={{ fill: '#555', fontSize: 9 }} />
        <Tooltip
          contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
          formatter={((val: any, name: any) => [Math.abs(Number(val ?? 0)), name === 'highs' ? '신고가' : '신저가']) as any}
        />
        <Bar dataKey="highs" stackId="a">
          {chartData.map((_, i) => <Cell key={i} fill="var(--color-up)" opacity={0.7} />)}
        </Bar>
        <Bar dataKey="lows" stackId="a">
          {chartData.map((_, i) => <Cell key={i} fill="var(--color-down)" opacity={0.7} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
