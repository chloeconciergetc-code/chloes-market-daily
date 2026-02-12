import { Treemap, ResponsiveContainer } from 'recharts'
import { GlassCard } from '../ui/GlassCard'
import { SectionHeader } from '../ui/SectionHeader'

interface HeatmapItem {
  name: string
  value: number
  change: number
}

function CustomCell({ x, y, width, height, name, change }: any) {
  if (width < 24 || height < 18) return null

  const intensity = Math.min(1, Math.abs(change) / 4)
  const color = change > 0
    ? `rgba(0, 230, 118, ${0.12 + intensity * 0.55})`
    : change < 0
    ? `rgba(255, 23, 68, ${0.12 + intensity * 0.55})`
    : 'rgba(255,255,255,0.04)'

  const textColor = change > 0
    ? `rgba(0, 230, 118, ${0.7 + intensity * 0.3})`
    : change < 0
    ? `rgba(255, 23, 68, ${0.7 + intensity * 0.3})`
    : 'rgba(255,255,255,0.3)'

  const showText = width > 48 && height > 28
  const showChange = width > 56 && height > 38

  return (
    <g>
      <rect x={x + 1.5} y={y + 1.5} width={width - 3} height={height - 3} rx={5}
        fill={color} stroke="rgba(6,6,11,0.9)" strokeWidth={1.5} />
      {showText && (
        <text x={x + width / 2} y={y + height / 2 - (showChange ? 6 : 0)}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.9)" fontSize={width > 90 ? 11 : 9} fontWeight={600}
          fontFamily="var(--font-sans)">
          {name?.length > 10 ? name.slice(0, 9) + '…' : name}
        </text>
      )}
      {showChange && (
        <text x={x + width / 2} y={y + height / 2 + 10}
          textAnchor="middle" dominantBaseline="middle"
          fill={textColor} fontSize={9} fontFamily="var(--font-mono)" fontWeight={500}>
          {change > 0 ? '+' : ''}{change?.toFixed(1)}%
        </text>
      )}
    </g>
  )
}

export function SectorHeatmap({ data }: { data: HeatmapItem[] }) {
  const treeData = data.map(d => ({ ...d, size: Math.max(d.value, 0.1) }))

  return (
    <div>
      <SectionHeader icon="🗺️" title="테마 히트맵" subtitle="Heatmap" delay={0.42} />
      <GlassCard delay={0.45}>
        <div className="w-full" style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeData}
              dataKey="size"
              stroke="none"
              content={<CustomCell />}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  )
}
