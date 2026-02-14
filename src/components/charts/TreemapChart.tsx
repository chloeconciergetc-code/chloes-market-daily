import { useState, useRef, useCallback } from 'react'
import { squarify } from '../../lib/squarify'
import type { LayoutRect } from '../../lib/squarify'
import type { HeatmapStock } from '../../types/market'

interface TooltipState {
  name: string
  ticker: string
  change: number
  sector: string
  value: number
  x: number
  y: number
}

function fmtCap(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`
  return `${v.toLocaleString()}억`
}

export function TreemapChart({ data, height = 360, onItemClick }: { data: HeatmapStock[]; height?: number; onItemClick?: (item: LayoutRect) => void }) {
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

          const showText = w > 36 && h > 22
          const showChange = w > 48 && h > 34
          const nameFontSize = w > 120 ? 13 : w > 80 ? 11 : 10
          const maxChars = w > 120 ? 10 : w > 80 ? 7 : 5
          const displayName = rect.name.length > maxChars ? rect.name.slice(0, maxChars - 1) + '…' : rect.name

          return (
            <g
              key={i}
              onMouseEnter={(e) => setTooltip({ name: rect.name, ticker: rect.ticker, change: rect.change, sector: rect.sector, value: rect.value, x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onItemClick?.(rect)}
              style={{ cursor: onItemClick ? 'pointer' : 'default' }}
            >
              <rect x={x} y={y} width={w} height={h} rx={rx}
                fill={color} stroke="var(--bg-base)" strokeWidth={1} />
              {showText && (
                <text x={x + w / 2} y={y + h / 2 - (showChange ? 6 : 0)}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="rgba(255,255,255,0.95)" fontSize={nameFontSize} fontWeight={700}
                  fontFamily="var(--font-sans)">
                  {displayName}
                </text>
              )}
              {showChange && (
                <text x={x + w / 2} y={y + h / 2 + 10}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="rgba(255,255,255,0.7)" fontSize={10} fontFamily="var(--font-mono)" fontWeight={600}>
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
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-[var(--radius-md)]"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 50,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[var(--text-primary)] font-semibold fs-body" style={{ fontFamily: 'var(--font-sans)' }}>{tooltip.name}</span>
            <span className="text-[var(--text-muted)] font-mono fs-micro">{tooltip.ticker}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-mono font-bold fs-body ${tooltip.change >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
              {tooltip.change > 0 ? '+' : ''}{tooltip.change.toFixed(2)}%
            </span>
            <span className="text-[var(--text-tertiary)] font-mono fs-micro">
              시총 {fmtCap(tooltip.value)}
            </span>
          </div>
          <div className="text-[var(--text-muted)] fs-micro mt-0.5">{tooltip.sector}</div>
        </div>
      )}
    </div>
  )
}
