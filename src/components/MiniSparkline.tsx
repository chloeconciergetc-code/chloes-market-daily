interface Props {
  data: { adv: number; dec: number }[]
  width?: number
  height?: number
}

export default function MiniSparkline({ data, width = 160, height = 40 }: Props) {
  if (!data.length) return null
  const values = data.map(d => d.adv - d.dec)
  const max = Math.max(...values.map(Math.abs), 1)
  const step = width / (values.length - 1 || 1)
  const mid = height / 2

  const points = values.map((v, i) => `${i * step},${mid - (v / max) * (mid - 2)}`).join(' ')
  return (
    <svg width={width} height={height} className="opacity-70">
      <line x1={0} y1={mid} x2={width} y2={mid} stroke="rgba(255,255,255,0.1)" />
      <polyline fill="none" stroke="var(--color-up)" strokeWidth={1.5} points={points} />
    </svg>
  )
}
