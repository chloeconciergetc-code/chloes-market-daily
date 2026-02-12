import { useState } from 'react'
import { Treemap, ResponsiveContainer } from 'recharts'
import { GlassCard } from '../ui/GlassCard'
import { SectionHeader } from '../ui/SectionHeader'

interface HeatmapItem {
  name: string
  value: number
  change: number
}

function HeatmapTooltip({ active, payload }: { active?: { name: string; change: number; x: number; y: number }; payload?: any }) {
  if (!active) return null
  return (
    <div
      className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg text-xs font-mono"
      style={{
        left: active.x,
        top: active.y - 48,
        background: 'rgba(12,12,20,0.96)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        transform: 'translateX(-50%)',
      }}
    >
      <div className="text-white/90 font-semibold mb-0.5" style={{ fontFamily: 'var(--font-sans)' }}>{active.name}</div>
      <div className={active.change >= 0 ? 'text-[#00e676]' : 'text-[#ff1744]'}>
        {active.change > 0 ? '+' : ''}{active.change.toFixed(2)}%
      </div>
    </div>
  )
}

function CustomCell({ x, y, width, height, name, change, onHover, onLeave }: any) {
  if (width < 24 || height < 18) return null

  const intensity = Math.min(1, Math.abs(change) / 4)
  const color = change > 0
    ? `rgba(0, 230, 118, ${0.7 + intensity * 0.15})`
    : change < 0
    ? `rgba(255, 23, 68, ${0.7 + intensity * 0.15})`
    : 'rgba(255,255,255,0.04)'

  const textColor = change > 0
    ? `rgba(0, 230, 118, ${0.7 + intensity * 0.3})`
    : change < 0
    ? `rgba(255, 23, 68, ${0.7 + intensity * 0.3})`
    : 'rgba(255,255,255,0.3)'

  const showText = width > 48 && height > 28
  const showChange = width > 56 && height > 38

  return (
    <g
      onMouseEnter={(e) => onHover?.({ name, change, x: e.clientX, y: e.clientY })}
      onMouseMove={(e) => onHover?.({ name, change, x: e.clientX, y: e.clientY })}
      onMouseLeave={() => onLeave?.()}
      style={{ cursor: 'pointer' }}
    >
      <rect x={x + 2} y={y + 2} width={width - 4} height={height - 4} rx={5}
        fill={color} stroke="rgba(6,6,11,0.9)" strokeWidth={1.5} />
      {showText && (
        <text x={x + width / 2} y={y + height / 2 - (showChange ? 6 : 0)}
          textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.9)" fontSize={width > 90 ? 11 : 10} fontWeight={600}
          fontFamily="var(--font-sans)" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          {name?.length > (width > 90 ? 14 : 8) ? name.slice(0, width > 90 ? 13 : 7) + '…' : name}
        </text>
      )}
      {showChange && (
        <text x={x + width / 2} y={y + height / 2 + 10}
          textAnchor="middle" dominantBaseline="middle"
          fill={textColor} fontSize={9} fontFamily="var(--font-mono)" fontWeight={600} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
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
      <SectionHeader icon="🗺️" title="테마 히트맵" subtitle="Heatmap" delay={0.42} />
      <GlassCard delay={0.45}>
        <div className="w-full relative" style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeData}
              dataKey="size"
              stroke="none"
              content={<CustomCell onHover={setTooltip} onLeave={() => setTooltip(null)} />}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </ResponsiveContainer>
        </div>
        {tooltip && <HeatmapTooltip active={tooltip} />}
      </GlassCard>
    </div>
  )
}
