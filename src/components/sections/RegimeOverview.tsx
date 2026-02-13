import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import { Sparkline } from '../ui/Sparkline'
import type { MarketRegimeData, IndexChartData, MarketSummary, BreadthDay } from '../../types/market'

const regimeConfig: Record<string, { color: string; bgColor: string; label: string; emoji: string }> = {
  'risk-on':         { color: 'var(--regime-1)', bgColor: 'rgba(34,197,94,0.10)',  label: 'RISK ON',      emoji: '🟢' },
  'neutral-bullish': { color: 'var(--regime-2)', bgColor: 'rgba(132,204,22,0.10)', label: 'NEUTRAL BULL', emoji: '🟡' },
  'neutral':         { color: 'var(--regime-3)', bgColor: 'rgba(234,179,8,0.10)',  label: 'NEUTRAL',      emoji: '⚪' },
  'neutral-bearish': { color: 'var(--regime-4)', bgColor: 'rgba(249,115,22,0.10)', label: 'NEUTRAL BEAR', emoji: '🟠' },
  'risk-off':        { color: 'var(--regime-5)', bgColor: 'rgba(239,68,68,0.10)',  label: 'RISK OFF',     emoji: '🔴' },
}

/* ── Animated Circular Gauge ── */
function CircularGauge({ value, color }: { value: number; color: string }) {
  const r = 54, cx = 60, cy = 60
  const circumference = 2 * Math.PI * r
  const rotation = -225

  const count = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v))
  const progress = useTransform(count, v => Math.max(0, Math.min(1, v / 100)))
  const dashArray = useTransform(progress, p => `${p * circumference * 0.75} ${circumference}`)

  useEffect(() => {
    const ctrl = animate(count, value, { duration: 1.2, ease: 'easeOut' })
    return ctrl.stop
  }, [value, count])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${0.75 * circumference} ${circumference}`}
          transform={`rotate(${rotation} ${cx} ${cy})`} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          style={{ strokeDasharray: dashArray, filter: `drop-shadow(0 0 8px ${color}40)` }}
          transform={`rotate(${rotation} ${cx} ${cy})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="font-mono font-bold leading-none fs-hero" style={{ color }}>{rounded}</motion.span>
        <span className="text-[var(--text-muted)] font-mono fs-micro">/100</span>
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
      <span className="text-[var(--text-tertiary)] font-semibold uppercase tracking-wider fs-micro">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="font-mono font-bold fs-title">
          {last.c.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        <span className="font-mono font-semibold fs-caption" style={{ color }}>
          {isUp ? '+' : ''}{pct.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

/* ── Up/Down Ratio Bar ── */
function UpDownBar({ up, down, flat }: { up: number; down: number; flat: number }) {
  const total = up + down + flat || 1
  const upPct = (up / total) * 100
  const downPct = (down / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-up)] font-mono font-bold fs-title">{up}</span>
          <span className="text-[var(--text-muted)] fs-micro">상승</span>
        </div>
        <span className="text-[var(--text-muted)] fs-micro">보합 {flat}</span>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)] fs-micro">하락</span>
          <span className="text-[var(--color-down)] font-mono font-bold fs-title">{down}</span>
        </div>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--bg-elevated)] gap-0.5">
        <div className="rounded-l-full transition-all duration-700" style={{ width: `${upPct}%`, background: 'var(--color-up)' }} />
        <div className="rounded-r-full transition-all duration-700" style={{ width: `${downPct}%`, background: 'var(--color-down)' }} />
      </div>
    </div>
  )
}

/* ── Stat Card ── */
function StatCard({ label, value, unit, signal, sparkData, sparkColor }: {
  label: string; value: string; unit?: string; signal?: 'green' | 'yellow' | 'red'
  sparkData?: number[]; sparkColor?: string
}) {
  const signalColor = signal === 'green' ? 'var(--signal-green)' : signal === 'red' ? 'var(--signal-red)' : 'var(--signal-yellow)'

  return (
    <div className="relative p-3.5 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-hover)] transition-all duration-200">
      {signal && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse-glow"
          style={{ backgroundColor: signalColor, boxShadow: `0 0 6px ${signalColor}60` }} />
      )}
      <div className="text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-1.5 fs-micro">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono font-bold leading-none fs-headline">{value}</span>
        {unit && <span className="text-[var(--text-muted)] font-medium fs-caption">{unit}</span>}
      </div>
      {sparkData && sparkData.length > 0 && (
        <div className="mt-2">
          <Sparkline data={sparkData} color={sparkColor} width={90} height={18} />
        </div>
      )}
    </div>
  )
}

/* ── Main Export ── */
export function RegimeOverview({ regime, kospi, kosdaq, summary, breadth }: {
  regime: MarketRegimeData
  kospi?: IndexChartData
  kosdaq?: IndexChartData
  summary?: MarketSummary
  breadth?: BreadthDay[]
}) {
  const config = regimeConfig[regime.regime] || regimeConfig['neutral']
  const composite = regime.composite ?? 50

  const entries = Object.entries(regime.components)
  const bullish = entries.filter(([, v]) => (v ?? 50) >= 60).length
  const bearish = entries.filter(([, v]) => (v ?? 50) < 40).length

  const lastBreadth = breadth?.[breadth.length - 1]
  const adrSpark = summary?.sparkline.map(s => s.adr)
  const tvSpark = summary?.sparkline.map(s => s.tradingValue)

  return (
    <div className="space-y-4">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-hover)] p-6 md:p-8"
        style={{ background: `linear-gradient(135deg, var(--bg-card) 0%, ${config.bgColor} 100%)`, boxShadow: 'var(--shadow-elevated)' }}>
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: config.color }} />

        <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
          {/* Left: Gauge */}
          <div className="flex flex-col items-center gap-3">
            <CircularGauge value={composite} color={config.color} />
            <div className="text-center">
              <div className="font-bold fs-headline" style={{ color: config.color }}>{regime.label}</div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-semibold tracking-wider fs-micro"
                style={{ color: config.color, background: config.bgColor, border: `1px solid ${config.color}30` }}>
                {config.emoji} {config.label}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-[var(--color-up)] fs-caption">
                <span className="font-bold">{bullish}</span> <span className="text-[var(--text-muted)]">강세</span>
              </span>
              <span className="text-[var(--border-default)]">·</span>
              <span className="font-mono text-[var(--color-down)] fs-caption">
                <span className="font-bold">{bearish}</span> <span className="text-[var(--text-muted)]">약세</span>
              </span>
            </div>
          </div>

          {/* Right: Index + Up/Down + Stats */}
          <div className="flex flex-col gap-4">
            {(kospi || kosdaq) && (
              <div className="space-y-2 p-4 rounded-[var(--radius-md)] bg-[var(--bg-base)]/50 border border-[var(--border-default)]">
                {kospi && <MiniIndex label="KOSPI" data={kospi} />}
                {kosdaq && <MiniIndex label="KOSDAQ" data={kosdaq} />}
              </div>
            )}

            {summary && (
              <UpDownBar up={summary.latest.up} down={summary.latest.down} flat={summary.latest.flat} />
            )}

            {/* Regime component pills */}
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
                    <span className="text-[var(--text-secondary)] fs-micro">{labels[key] || key}</span>
                    <span className="font-mono font-bold fs-micro" style={{ color: pillColor }}>{v.toFixed(0)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="ADR"
            value={summary.latest.adr.toFixed(1)}
            signal={summary.signals.adr}
            sparkData={adrSpark}
            sparkColor={summary.signals.adr === 'green' ? 'var(--color-up)' : summary.signals.adr === 'red' ? 'var(--color-down)' : 'var(--signal-yellow)'}
          />
          <StatCard
            label="거래대금"
            value={summary.latest.tradingValue.toFixed(1)}
            unit="조원"
            signal={summary.signals.tradingValue}
            sparkData={tvSpark}
            sparkColor="var(--color-blue)"
          />
          <StatCard
            label="MA20 돌파율"
            value={lastBreadth ? `${lastBreadth.aboveMa20Pct.toFixed(1)}` : '—'}
            unit="%"
            signal={lastBreadth ? (lastBreadth.aboveMa20Pct > 60 ? 'green' : lastBreadth.aboveMa20Pct < 40 ? 'red' : 'yellow') : undefined}
          />
          <StatCard
            label="52주 신고가"
            value={lastBreadth ? `${lastBreadth.newHighs}` : '—'}
            unit="종목"
            signal={lastBreadth ? (lastBreadth.spread > 10 ? 'green' : lastBreadth.spread < -10 ? 'red' : 'yellow') : undefined}
          />
        </div>
      )}
    </div>
  )
}
