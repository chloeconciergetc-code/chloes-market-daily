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
      className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-[var(--radius-sm)] font-mono"
      style={{
        left: active.x,
        top: active.y - 44,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-elevated)',
        transform: 'translateX(-50%)',
        fontSize: 'var(--text-caption)',
      }}
    >
      <div className="text-[var(--text-primary)] font-semibold mb-0.5" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)' }}>{active.name}</div>
      <div className={active.change >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}>
        {active.change > 0 ? '+' : ''}{active.change.toFixed(2)}%
      </div>
    </div>
  )
}

function CustomCell({ x, y, width, height, name, change, onHover, onLeave }: any) {
  if (width < 20 || height < 16) return null

  const intensity = Math.min(1, Math.abs(change) / 4)
  const color = change > 0
    ? `rgba(34, 197, 94, ${0.5 + intensity * 0.3})`
    : change < 0
    ? `rgba(239, 68, 68, ${0.5 + intensity * 0.3})`
    : 'rgba(255,255,255,0.03)'

  const showText = width > 44 && height > 26
  const showChange = width > 52 && height > 36

  return (
    <g
      onMouseEnter={(e) => onHover?.({ name, change, x: e.clientX, y: e.clientY })}
      onMouseMove={(e) => onHover?.({ name, change, x: e.clientX, y: e.clientY })}
      onMouseLeave={() => onLeave?.()}
      style={{ cursor: 'pointer' }}
    >
      <rect x={x + 1.5} y={y + 1.5} width={width - 3} height={height - 3} rx={4}
        fill={color} stroke="var(--bg-base)" strokeWidth={1} />
      {showText && (
        <text x={x + width / 2} y={y + height / 2 - (showChange ? 5 : 0)}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.9)" fontSize={width > 80 ? 11 : 10} fontWeight={600}
          fontFamily="var(--font-sans)">
          {name?.length > (width > 80 ? 12 : 7) ? name.slice(0, width > 80 ? 11 : 6) + '…' : name}
        </text>
      )}
      {showChange && (
        <text x={x + width / 2} y={y + height / 2 + 9}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.6)" fontSize={9} fontFamily="var(--font-mono)" fontWeight={600}>
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
        <div className="w-full relative" style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeData}
              dataKey="size"
              stroke="none"
              content={<CustomCell onHover={setTooltip} onLeave={() => setTooltip(null)} />}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </ResponsiveContainer>
        </div>
        {tooltip && <HeatmapTooltip active={tooltip} />}
      </Card>
    </div>
  )
}
