export function Sparkline({ data, color = 'var(--color-up)', width = 80, height = 28 }: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 3

  const points = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return `${x},${y}`
  }).join(' ')

  // area fill path
  const areaPath = `M0,${height} L${points.split(' ').map(p => p).join(' L')} L${width},${height} Z`

  return (
    <svg width={width} height={height} className="inline-block overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* last dot */}
      {data.length > 1 && (() => {
        const lastX = width
        const lastY = height - pad - ((data[data.length - 1] - min) / range) * (height - pad * 2)
        return <circle cx={lastX} cy={lastY} r={2} fill={color} />
      })()}
    </svg>
  )
}
