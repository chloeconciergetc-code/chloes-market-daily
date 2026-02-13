import { useState, useRef, useCallback } from 'react'
import { squarify } from '../../lib/squarify'

interface HeatmapItem {
  name: string
  value: number
  change: number
}

interface TooltipState {
  name: string
  change: number
  x: number
  y: number
}

export function TreemapChart({ data, height = 360 }: { data: HeatmapItem[]; height?: number }) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(800)

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width)
        }
      })
      observer.observe(node)
      setContainerWidth(node.clientWidth)
      ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      return () => observer.disconnect()
    }
  }, [])

  const treeData = data.map(d => ({ ...d, value: Math.max(d.value, 0.1) }))
  const rects = squarify(treeData, containerWidth, height)

  const gap = 2
  const rx = 4

  return (
    <div ref={measuredRef} className="relative w-full" style={{ height }}>
      <svg width={containerWidth} height={height} className="absolute inset-0">
        {rects.map((rect, i) => {
          const x = rect.x + gap / 2
          const y = rect.y + gap / 2
          const w = rect.w - gap
          const h = rect.h - gap

          if (w < 8 || h < 8) return null

          const intensity = Math.min(1, Math.abs(rect.change) / 4)
          const color = rect.change > 0
            ? `rgba(34, 197, 94, ${0.45 + intensity * 0.35})`
            : rect.change < 0
            ? `rgba(239, 68, 68, ${0.45 + intensity * 0.35})`
            : 'rgba(255,255,255,0.03)'

          const showText = w > 44 && h > 26
          const showChange = w > 52 && h > 36
          const maxChars = w > 80 ? 12 : 7
          const displayName = rect.name.length > maxChars ? rect.name.slice(0, maxChars - 1) + '…' : rect.name

          return (
            <g
              key={i}
              onMouseEnter={(e) => setTooltip({ name: rect.name, change: rect.change, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setTooltip({ name: rect.name, change: rect.change, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={x} y={y} width={w} height={h} rx={rx}
                fill={color} stroke="var(--bg-base)" strokeWidth={1} />
              {showText && (
                <text x={x + w / 2} y={y + h / 2 - (showChange ? 5 : 0)}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="rgba(255,255,255,0.9)" fontSize={w > 80 ? 11 : 10} fontWeight={600}
                  fontFamily="var(--font-sans)">
                  {displayName}
                </text>
              )}
              {showChange && (
                <text x={x + w / 2} y={y + h / 2 + 9}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="rgba(255,255,255,0.6)" fontSize={9} fontFamily="var(--font-mono)" fontWeight={600}>
                  {rect.change > 0 ? '+' : ''}{rect.change.toFixed(1)}%
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-[var(--radius-sm)] font-mono fs-caption"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 40,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="text-[var(--text-primary)] font-semibold mb-0.5" style={{ fontFamily: 'var(--font-sans)' }}>{tooltip.name}</div>
          <div className={tooltip.change >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}>
            {tooltip.change > 0 ? '+' : ''}{tooltip.change.toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  )
}
