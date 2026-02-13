import type { MarketRegimeData, IndexChartData, InvestorFlowData } from '../../types/market'

const regimeConfig: Record<string, { color: string; bgColor: string; label: string; emoji: string }> = {
  'risk-on':         { color: 'var(--regime-1)', bgColor: 'rgba(34,197,94,0.10)',  label: 'RISK ON',      emoji: '🟢' },
  'neutral-bullish': { color: 'var(--regime-2)', bgColor: 'rgba(132,204,22,0.10)', label: 'NEUTRAL BULL', emoji: '🟡' },
  'neutral':         { color: 'var(--regime-3)', bgColor: 'rgba(234,179,8,0.10)',  label: 'NEUTRAL',      emoji: '⚪' },
  'neutral-bearish': { color: 'var(--regime-4)', bgColor: 'rgba(249,115,22,0.10)', label: 'NEUTRAL BEAR', emoji: '🟠' },
  'risk-off':        { color: 'var(--regime-5)', bgColor: 'rgba(239,68,68,0.10)',  label: 'RISK OFF',     emoji: '🔴' },
}

/* ── Circular Gauge ── */
function CircularGauge({ value, color }: { value: number; color: string }) {
  const r = 54
  const cx = 60, cy = 60
  const circumference = 2 * Math.PI * r
  const progress = Math.max(0, Math.min(1, value / 100))
  // Start from top (-90deg), go clockwise
  const strokeDasharray = `${progress * circumference * 0.75} ${circumference}`
  const rotation = -225 // Start from bottom-left, sweep 270deg

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${0.75 * circumference} ${circumference}`}
          transform={`rotate(${rotation} ${cx} ${cy})`} />
        {/* Progress */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          transform={`rotate(${rotation} ${cx} ${cy})`}
          className="transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }} />
      </svg>
      {/* Center number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold leading-none" style={{ fontSize: 'var(--text-hero)', color }}>{value.toFixed(0)}</span>
        <span className="text-[var(--text-muted)] font-mono" style={{ fontSize: 'var(--text-micro)' }}>/100</span>
      </div>
    </div>
  )
}

/* ── Mini Index Display ── */
function MiniIndex({ label, data }: { label: string; data: IndexChartData }) {
  const last = data.candles[data.candles.length - 1]
  const prev = data.candles[data.candles.length - 2]
  if (!last || !prev) return null
  const change = last.c - prev.c
  const pct = (change / prev.c) * 100
  const isUp = change >= 0
  const color = isUp ? 'var(--color-up)' : 'var(--color-down)'

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--text-tertiary)] font-semibold uppercase tracking-wider" style={{ fontSize: 'var(--text-micro)' }}>{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="font-mono font-bold" style={{ fontSize: 'var(--text-title)' }}>
          {last.c.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        <span className="font-mono font-semibold" style={{ fontSize: 'var(--text-caption)', color }}>
          {isUp ? '+' : ''}{pct.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

/* ── Flow Summary ── */
function FlowSummary({ data }: { data: InvestorFlowData }) {
  const latest = data.kospi[data.kospi.length - 1]
  if (!latest) return null

  const fmt = (v: number) => {
    if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}조`
    return `${v >= 0 ? '+' : ''}${(v / 1000).toFixed(0)}천억`
  }
  const cls = (v: number) => v >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'

  const items = [
    { label: '외국인', val: latest.foreign },
    { label: '기관', val: latest.institution },
    { label: '개인', val: latest.individual },
  ]

  return (
    <div className="flex items-center gap-4">
      {items.map(({ label, val }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>{label}</span>
          <span className={`font-mono font-semibold ${cls(val)}`} style={{ fontSize: 'var(--text-caption)' }}>{fmt(val)}</span>
        </div>
      ))}
    </div>
  )
}

export function HeroDashboard({ regime, kospi, kosdaq, investorFlow }: {
  regime: MarketRegimeData
  kospi?: IndexChartData
  kosdaq?: IndexChartData
  investorFlow?: InvestorFlowData
}) {
  const config = regimeConfig[regime.regime] || regimeConfig['neutral']
  const composite = regime.composite ?? 50

  const entries = Object.entries(regime.components)
  const bullish = entries.filter(([, v]) => (v ?? 50) >= 60).length
  const bearish = entries.filter(([, v]) => (v ?? 50) < 40).length

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-hover)] p-6 md:p-8"
      style={{ background: `linear-gradient(135deg, var(--bg-card) 0%, ${config.bgColor} 100%)`, boxShadow: 'var(--shadow-elevated)' }}>
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: config.color }} />

      <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
        {/* Left: Gauge + Regime */}
        <div className="flex flex-col items-center gap-3">
          <CircularGauge value={composite} color={config.color} />
          <div className="text-center">
            <div className="font-bold" style={{ fontSize: 'var(--text-headline)', color: config.color }}>
              {regime.label}
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-semibold tracking-wider"
              style={{ fontSize: 'var(--text-micro)', color: config.color, background: config.bgColor, border: `1px solid ${config.color}30` }}>
              {config.emoji} {config.label}
            </div>
          </div>
          {/* Signal counts */}
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[var(--color-up)]" style={{ fontSize: 'var(--text-caption)' }}>
              <span className="font-bold">{bullish}</span> <span className="text-[var(--text-muted)]">강세</span>
            </span>
            <span className="text-[var(--border-default)]">·</span>
            <span className="font-mono text-[var(--color-down)]" style={{ fontSize: 'var(--text-caption)' }}>
              <span className="font-bold">{bearish}</span> <span className="text-[var(--text-muted)]">약세</span>
            </span>
          </div>
        </div>

        {/* Right: Index + Flow Summary */}
        <div className="flex flex-col gap-4">
          {/* Index prices */}
          {(kospi || kosdaq) && (
            <div className="space-y-2 p-4 rounded-[var(--radius-md)] bg-[var(--bg-base)]/50 border border-[var(--border-default)]">
              {kospi && <MiniIndex label="KOSPI" data={kospi} />}
              {kosdaq && <MiniIndex label="KOSDAQ" data={kosdaq} />}
            </div>
          )}

          {/* Investor flow summary */}
          {investorFlow && (
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg-base)]/30">
              <div className="text-[var(--text-muted)] mb-1.5" style={{ fontSize: 'var(--text-micro)' }}>오늘 수급 (KOSPI)</div>
              <FlowSummary data={investorFlow} />
            </div>
          )}

          {/* Regime components - horizontal pills */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(regime.components).map(([key, value]) => {
              const v = value ?? 50
              const pillColor = v >= 65 ? 'var(--regime-1)' : v >= 55 ? 'var(--regime-2)' : v >= 45 ? 'var(--regime-3)' : v >= 35 ? 'var(--regime-4)' : 'var(--regime-5)'
              const labels: Record<string, string> = {
                adr: 'ADR', breadth: 'MA20돌파', hlSpread: '신고/저',
                tradingValue: '거래대금', foreignFlow: '외인', volatility: '변동성',
              }
              return (
                <div key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                  style={{ borderColor: `${pillColor}30`, background: `${pillColor}10` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pillColor }} />
                  <span className="text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-micro)' }}>{labels[key] || key}</span>
                  <span className="font-mono font-bold" style={{ fontSize: 'var(--text-micro)', color: pillColor }}>{v.toFixed(0)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
