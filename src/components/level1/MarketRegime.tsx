import { Card } from '../ui/Card'
import type { MarketRegimeData } from '../../types/market'

const componentLabels: Record<string, { label: string; desc: string }> = {
  adr: { label: 'ADR', desc: '등락비율' },
  breadth: { label: 'MA20 돌파율', desc: '20일선 위 종목' },
  hlSpread: { label: '신고/저 스프레드', desc: '52주 신고가-신저가' },
  tradingValue: { label: '거래대금', desc: '20일 평균 대비' },
  foreignFlow: { label: '외국인 수급', desc: '순매수 추이' },
  volatility: { label: '변동성', desc: '역방향 지표' },
}

const regimeConfig: Record<string, { color: string; bgColor: string; label: string; level: number }> = {
  'risk-on':         { color: 'var(--regime-1)', bgColor: 'rgba(34,197,94,0.08)',  label: 'RISK ON',        level: 5 },
  'neutral-bullish': { color: 'var(--regime-2)', bgColor: 'rgba(132,204,22,0.08)', label: 'NEUTRAL BULL',   level: 4 },
  'neutral':         { color: 'var(--regime-3)', bgColor: 'rgba(234,179,8,0.08)',  label: 'NEUTRAL',        level: 3 },
  'neutral-bearish': { color: 'var(--regime-4)', bgColor: 'rgba(249,115,22,0.08)', label: 'NEUTRAL BEAR',   level: 2 },
  'risk-off':        { color: 'var(--regime-5)', bgColor: 'rgba(239,68,68,0.08)',  label: 'RISK OFF',       level: 1 },
}

/* ── Semicircle Gauge ── */
function SemiGauge({ value, color }: { value: number; color: string }) {
  const r = 62
  const cx = 70, cy = 70
  const startAngle = Math.PI          // 180° (left)
  const endAngle = 0                   // 0° (right)
  const totalArc = Math.PI
  const progress = Math.max(0, Math.min(1, value / 100))
  const angle = startAngle - progress * totalArc

  // arc path
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy - r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(angle)
  const y2 = cy - r * Math.sin(angle)
  const largeArc = progress > 0.5 ? 1 : 0

  // tick marks for the 5 zones
  const ticks = [0, 20, 40, 60, 80, 100].map(v => {
    const a = startAngle - (v / 100) * totalArc
    return {
      x1: cx + (r - 4) * Math.cos(a),
      y1: cy - (r - 4) * Math.sin(a),
      x2: cx + (r + 4) * Math.cos(a),
      y2: cy - (r + 4) * Math.sin(a),
    }
  })

  // gradient stops for the track
  const gradientColors = ['var(--regime-5)', 'var(--regime-4)', 'var(--regime-3)', 'var(--regime-2)', 'var(--regime-1)']

  return (
    <svg viewBox="0 0 140 82" className="w-full max-w-[220px]">
      <defs>
        <linearGradient id="gaugeTrackGrad" x1="0" y1="0" x2="1" y2="0">
          {gradientColors.map((c, i) => (
            <stop key={i} offset={`${i * 25}%`} stopColor={c} stopOpacity={0.15} />
          ))}
        </linearGradient>
      </defs>

      {/* Track background with gradient */}
      <path
        d={`M ${cx + r * Math.cos(startAngle)} ${cy - r * Math.sin(startAngle)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(endAngle)} ${cy - r * Math.sin(endAngle)}`}
        fill="none" stroke="url(#gaugeTrackGrad)" strokeWidth="10" strokeLinecap="round"
      />

      {/* Active arc */}
      {progress > 0.001 && (
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          className="transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      )}

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      ))}

      {/* Needle dot */}
      <circle cx={x2} cy={y2} r="4" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />

      {/* Center value */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={color}
        fontSize="28" fontWeight="700" fontFamily="var(--font-mono)">
        {value.toFixed(0)}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="rgba(255,255,255,0.3)"
        fontSize="10" fontFamily="var(--font-mono)">
        / 100
      </text>
    </svg>
  )
}

/* ── Component Indicator (dot + bar) ── */
function ComponentRow({ label, desc, value, weight }: {
  label: string; desc: string; value: number; weight: number
}) {
  const getColor = (v: number) =>
    v >= 65 ? 'var(--regime-1)' :
    v >= 55 ? 'var(--regime-2)' :
    v >= 45 ? 'var(--regime-3)' :
    v >= 35 ? 'var(--regime-4)' :
    'var(--regime-5)'

  const color = getColor(value)

  return (
    <div className="group flex items-center gap-3 py-2">
      {/* Signal dot */}
      <div className="w-2 h-2 rounded-full shrink-0 animate-pulse-glow"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[var(--text-primary)] font-medium truncate" style={{ fontSize: 'var(--text-body)' }}>{label}</span>
          <span className="text-[var(--text-muted)] hidden sm:inline" style={{ fontSize: 'var(--text-micro)' }}>{desc}</span>
        </div>
        {/* Bar */}
        <div className="w-full h-1 bg-[var(--bg-elevated)] rounded-full mt-1.5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
        </div>
      </div>

      {/* Weight + Value */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[var(--text-muted)] font-mono" style={{ fontSize: 'var(--text-micro)' }}>
          {(weight * 100).toFixed(0)}%
        </span>
        <span className="font-mono font-bold w-8 text-right" style={{ fontSize: 'var(--text-body)', color }}>
          {value.toFixed(0)}
        </span>
      </div>
    </div>
  )
}

/* ── Main Component ── */
export function MarketRegime({ data }: { data: MarketRegimeData }) {
  const config = regimeConfig[data.regime] || regimeConfig['neutral']
  const composite = data.composite ?? 50

  const entries = Object.entries(data.components)
  const bullish = entries.filter(([, v]) => (v ?? 50) >= 60).length
  const bearish = entries.filter(([, v]) => (v ?? 50) < 40).length
  const neutral = entries.length - bullish - bearish

  return (
    <div>
      {/* Hero Section - Full width gradient banner */}
      <Card tier="elevated" className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse at 30% 50%, ${config.color}15, transparent 70%)` }} />

        <div className="relative grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-center">
          {/* Left: Gauge + Label */}
          <div className="flex flex-col items-center text-center">
            <SemiGauge value={composite} color={config.color} />

            <div className="mt-3 flex items-center gap-2">
              <span className="font-bold" style={{ fontSize: 'var(--text-headline)', color: config.color }}>
                {data.label}
              </span>
            </div>

            <div className="mt-2 px-4 py-1 rounded-full font-mono font-semibold tracking-wider"
              style={{ fontSize: 'var(--text-caption)', color: config.color, background: config.bgColor, border: `1px solid ${config.color}22` }}>
              {config.label}
            </div>

            {/* Quick signal counts */}
            <div className="flex items-center gap-4 mt-4">
              <div className="text-center">
                <div className="font-mono font-bold text-[var(--color-up)]" style={{ fontSize: 'var(--text-title)' }}>{bullish}</div>
                <div className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>강세</div>
              </div>
              <div className="w-px h-6 bg-[var(--border-default)]" />
              <div className="text-center">
                <div className="font-mono font-bold text-[var(--text-tertiary)]" style={{ fontSize: 'var(--text-title)' }}>{neutral}</div>
                <div className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>중립</div>
              </div>
              <div className="w-px h-6 bg-[var(--border-default)]" />
              <div className="text-center">
                <div className="font-mono font-bold text-[var(--color-down)]" style={{ fontSize: 'var(--text-title)' }}>{bearish}</div>
                <div className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>약세</div>
              </div>
            </div>
          </div>

          {/* Right: Component breakdown */}
          <div className="border-l border-[var(--border-default)] pl-6 hidden lg:block">
            <h3 className="font-semibold text-[var(--text-secondary)] mb-2" style={{ fontSize: 'var(--text-caption)' }}>
              세부 지표 BREAKDOWN
            </h3>
            <div className="space-y-0.5">
              {Object.entries(data.components).map(([key, value]) => {
                const v = value ?? 50
                const meta = componentLabels[key] || { label: key, desc: '' }
                const weight = data.weights[key] ?? 0
                return (
                  <ComponentRow key={key} label={meta.label} desc={meta.desc} value={v} weight={weight} />
                )
              })}
            </div>
          </div>

          {/* Mobile: Component list */}
          <div className="lg:hidden border-t border-[var(--border-default)] pt-4">
            <h3 className="font-semibold text-[var(--text-secondary)] mb-2" style={{ fontSize: 'var(--text-caption)' }}>
              세부 지표
            </h3>
            <div className="space-y-0.5">
              {Object.entries(data.components).map(([key, value]) => {
                const v = value ?? 50
                const meta = componentLabels[key] || { label: key, desc: '' }
                const weight = data.weights[key] ?? 0
                return (
                  <ComponentRow key={key} label={meta.label} desc={meta.desc} value={v} weight={weight} />
                )
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
