export function Sparkline({ data, color = 'var(--color-up)', width = 80, height = 24 }: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  )
}
