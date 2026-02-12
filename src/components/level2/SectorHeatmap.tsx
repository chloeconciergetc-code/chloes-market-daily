import { useState } from 'react'
import { Treemap, ResponsiveContainer } from 'recharts'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'

interface HeatmapItem {
  name: string
  value: number
  change: number
}

function HeatmapTooltip({ active }: { active?: { name: string; change: number; x: number; y: number } }) {
  if (!active) return null
  return (
    <div
      className="fixed z-50 pointer-events-none px-3 py-2 rounded-[var(--radius-md)] font-mono"
      style={{
        left: active.x,
        top: active.y - 48,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-elevated)',
        transform: 'translateX(-50%)',
        fontSize: 'var(--text-body)',
      }}
    >
      <div className="text-[var(--text-primary)] font-semibold mb-0.5" style={{ fontFamily: 'var(--font-sans)' }}>{active.name}</div>
      <div className={active.change >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}>
        {active.change > 0 ? '+' : ''}{active.change.toFixed(2)}%
      </div>
    </div>
  )
}

function CustomCell({ x, y, width, height, name, change, onHover, onLeave }: any) {
  if (width < 24 || height < 18) return null

  const intensity = Math.min(1, Math.abs(change) / 4)
  const color = change > 0
    ? `rgba(34, 197, 94, ${0.55 + intensity * 0.25})`
    : change < 0
    ? `rgba(239, 68, 68, ${0.55 + intensity * 0.25})`
    : 'rgba(255,255,255,0.04)'

  const showText = width > 48 && height > 28
  const showChange = width > 56 && height > 38

  return (
    <g
      onMouseEnter={(e) => onHover?.({ name, change, x: e.clientX, y: e.clientY })}
      onMouseMove={(e) => onHover?.({ name, change, x: e.clientX, y: e.clientY })}
      onMouseLeave={() => onLeave?.()}
      style={{ cursor: 'pointer' }}
    >
      <rect x={x + 2} y={y + 2} width={width - 4} height={height - 4} rx={4}
        fill={color} stroke="var(--bg-base)" strokeWidth={1.5} />
      {showText && (
        <text x={x + width / 2} y={y + height / 2 - (showChange ? 6 : 0)}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.92)" fontSize={width > 90 ? 12 : 11} fontWeight={600}
          fontFamily="var(--font-sans)">
          {name?.length > (width > 90 ? 14 : 8) ? name.slice(0, width > 90 ? 13 : 7) + '…' : name}
        </text>
      )}
      {showChange && (
        <text x={x + width / 2} y={y + height / 2 + 10}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.7)" fontSize={10} fontFamily="var(--font-mono)" fontWeight={600}>
          {change > 0 ? '+' : ''}{change?.toFixed(1)}%
        </text>
      )}
    </g>
  )
}

export function SectorHeatmap({ data }: { data: HeatmapItem[] }) {
  const [tooltip, setTooltip] = useState<{ name: string; change: number; x: number; y: number } | null>(null)
  const treeData = data.map(d => ({ ...d, size: Math.max(d.value, 0.1) }))

  return (
    <div>
      <SectionHeader title="테마 히트맵" subtitle="Heatmap" />
      <Card>
        <div className="w-full relative" style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeData}
              dataKey="size"
              stroke="none"
              content={<CustomCell onHover={setTooltip} onLeave={() => setTooltip(null)} />}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </ResponsiveContainer>
        </div>
        {tooltip && <HeatmapTooltip active={tooltip} />}
      </Card>
    </div>
  )
}
