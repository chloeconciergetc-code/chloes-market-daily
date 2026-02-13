import { useState, useId } from 'react'
import { scaleLinear } from 'd3-scale'
import { CHART } from '../../lib/chartStyles'
import { fmtDateLabel } from '../../lib/format'

interface RefLine {
  value: number
  label?: string
  color?: string
}

interface Props {
  data: { date: string; value: number }[]
  color?: string
  height?: number
  width?: number
  yDomain?: [number, number]
  yFormat?: (v: number) => string
  refLines?: RefLine[]
  gradientOpacity?: [number, number]
}

export function AreaChart({
  data,
  color = 'var(--chart-1)',
  height = 240,
  width = 600,
  yDomain,
  yFormat = (v) => `${v}`,
  refLines = [],
  gradientOpacity = [0.2, 0.01],
}: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const gradId = useId()

  if (!data.length) return null

  const margin = { top: 16, right: 8, bottom: 28, left: 44 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const values = data.map(d => d.value)
  const yMin = yDomain?.[0] ?? Math.min(...values) - Math.abs(Math.min(...values)) * 0.05
  const yMax = yDomain?.[1] ?? Math.max(...values) + Math.abs(Math.max(...values)) * 0.05

  const xScale = scaleLinear().domain([0, data.length - 1]).range([margin.left, width - margin.right])
  const yScale = scaleLinear().domain([yMin, yMax]).range([height - margin.bottom, margin.top])

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.value).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${xScale(data.length - 1).toFixed(1)},${yScale(yMin).toFixed(1)} L${xScale(0).toFixed(1)},${yScale(yMin).toFixed(1)} Z`

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (yMax - yMin) * i / 4)
  const xInterval = Math.max(1, Math.ceil(data.length / 6))

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={gradientOpacity[0]} />
            <stop offset="100%" stopColor={color} stopOpacity={gradientOpacity[1]} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((val, i) => (
          <g key={i}>
            <line x1={margin.left} x2={width - margin.right} y1={yScale(val)} y2={yScale(val)}
              stroke={CHART.grid.stroke} strokeDasharray={CHART.grid.dasharray} />
            <text x={margin.left - 4} y={yScale(val) + 3}
              fill={CHART.axis.fill} fontSize={CHART.axis.fontSize} fontFamily={CHART.axis.fontFamily} textAnchor="end">
              {yFormat(val)}
            </text>
          </g>
        ))}

        {/* Reference lines */}
        {refLines.map((rl, i) => (
          <g key={`rl-${i}`}>
            <line x1={margin.left} x2={width - margin.right} y1={yScale(rl.value)} y2={yScale(rl.value)}
              stroke={rl.color || CHART.refLine.stroke} strokeWidth={CHART.refLine.strokeWidth} strokeDasharray={CHART.refLine.dasharray} />
            {rl.label && (
              <text x={width - margin.right + 2} y={yScale(rl.value) + 3}
                fill={rl.color || CHART.axis.fill} fontSize={9} fontFamily={CHART.axis.fontFamily}>
                {rl.label}
              </text>
            )}
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />

        {/* X labels */}
        {data.map((d, i) => {
          if (i % xInterval !== 0 && i !== data.length - 1) return null
          return (
            <text key={i} x={xScale(i)} y={height - 4}
              fill={CHART.axis.fill} fontSize={CHART.axis.fontSize} fontFamily={CHART.axis.fontFamily} textAnchor="middle">
              {fmtDateLabel(d.date)}
            </text>
          )
        })}

        {/* Hover detection rects */}
        {data.map((_, i) => (
          <rect key={i} x={xScale(i) - innerW / data.length / 2} y={margin.top} width={innerW / data.length} height={innerH}
            fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}

        {/* Hover indicator */}
        {hover != null && data[hover] && (
          <g>
            <line x1={xScale(hover)} x2={xScale(hover)} y1={margin.top} y2={height - margin.bottom}
              stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
            <circle cx={xScale(hover)} cy={yScale(data[hover].value)} r={3.5} fill={color} stroke="var(--bg-card)" strokeWidth={2} />
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {hover != null && data[hover] && (
        <div
          className="absolute z-10 pointer-events-none px-2.5 py-1.5 rounded-[var(--radius-sm)] font-mono fs-caption"
          style={{
            left: `${(xScale(hover) / width) * 100}%`,
            top: `${(yScale(data[hover].value) / height) * 100 - 12}%`,
            transform: 'translateX(-50%)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="text-[var(--text-secondary)]">{fmtDateLabel(data[hover].date)}</div>
          <div style={{ color }} className="font-semibold">{yFormat(data[hover].value)}</div>
        </div>
      )}
    </div>
  )
}
