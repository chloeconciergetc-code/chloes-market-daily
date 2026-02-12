import { Treemap, ResponsiveContainer } from 'recharts'
import { GlassCard } from '../ui/GlassCard'

interface HeatmapItem {
  name: string
  value: number
  change: number
}

function CustomCell({ x, y, width, height, name, change }: any) {
  if (width < 30 || height < 20) return null
  const color = change > 0 ? `rgba(0, 230, 118, ${Math.min(0.8, Math.abs(change) / 5)})` 
    : change < 0 ? `rgba(255, 23, 68, ${Math.min(0.8, Math.abs(change) / 5)})`
    : 'rgba(255,255,255,0.05)'

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4}
        fill={color} stroke="var(--bg-base)" strokeWidth={2} />
      {width > 50 && height > 30 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 5} textAnchor="middle"
            fill="white" fontSize={width > 80 ? 11 : 9} fontWeight={500}>
            {name?.length > 8 ? name.slice(0, 8) + '..' : name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle"
            fill="rgba(255,255,255,0.7)" fontSize={9} fontFamily="var(--font-mono)">
            {change > 0 ? '+' : ''}{change?.toFixed(1)}%
          </text>
        </>
      )}
    </g>
  )
}

export function SectorHeatmap({ data }: { data: HeatmapItem[] }) {
  const treeData = data.map(d => ({ ...d, size: Math.max(d.value, 0.1) }))

  return (
    <GlassCard delay={0.45}>
      <h3 className="text-sm text-[var(--text-secondary)] mb-3">🗺️ 테마 히트맵</h3>
      <ResponsiveContainer width="100%" height={280}>
        <Treemap
          data={treeData}
          dataKey="size"
          stroke="none"
          content={<CustomCell />}
        />
      </ResponsiveContainer>
    </GlassCard>
  )
}
