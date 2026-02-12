import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface TrendPoint {
  date: string
  count: number
}

export function HighTrendChart({ data }: { data: TrendPoint[] }) {
  const chartData = data.map(d => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="glass p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={18} className="text-emerald-400" />
        <h2 className="text-lg font-semibold">52주 신고가 추이</h2>
        <span className="text-xs text-white/30 ml-auto">최근 {data.length}거래일</span>
      </div>
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#fff',
              }}
              formatter={(value: any) => [`${value}종목`, '신고가']}
              labelFormatter={(label: any) => `2월 ${String(label).split('-')[1]}일`}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#34d399"
              strokeWidth={2.5}
              fill="url(#greenGradient)"
              dot={{ r: 4, fill: '#34d399', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#34d399', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
