import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { Sparkline } from '../ui/Sparkline'
import type { MarketSummary, BreadthDay } from '../../types/market'

/* ── Thermometer Bar ── */
function ThermometerBar({ label, value, max, color, subtext }: {
  label: string; value: number; max: number; color: string; subtext?: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-medium text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-caption)' }}>{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono font-bold" style={{ fontSize: 'var(--text-title)', color }}>{value.toLocaleString()}</span>
          {subtext && <span className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>{subtext}</span>}
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
    </div>
  )
}

/* ── Stat Tile ── */
function StatTile({ label, value, unit, signal, sparkData, sparkColor }: {
  label: string; value: string; unit?: string; signal?: 'green' | 'yellow' | 'red'
  sparkData?: number[]; sparkColor?: string
}) {
  const signalColor = signal === 'green' ? 'var(--signal-green)' : signal === 'red' ? 'var(--signal-red)' : 'var(--signal-yellow)'

  return (
    <div className="relative p-4 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--border-hover)] transition-all duration-200 group">
      {/* Signal dot */}
      {signal && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse-glow"
          style={{ backgroundColor: signalColor, boxShadow: `0 0 6px ${signalColor}60` }} />
      )}

      <div className="text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-2" style={{ fontSize: 'var(--text-micro)' }}>
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono font-bold leading-none animate-count-up" style={{ fontSize: 'var(--text-display)' }}>{value}</span>
        {unit && <span className="text-[var(--text-muted)] font-medium" style={{ fontSize: 'var(--text-caption)' }}>{unit}</span>}
      </div>
      {sparkData && sparkData.length > 0 && (
        <div className="mt-3">
          <Sparkline data={sparkData} color={sparkColor} width={100} height={20} />
        </div>
      )}
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
          <span className="text-[var(--color-up)] font-mono font-bold" style={{ fontSize: 'var(--text-title)' }}>{up}</span>
          <span className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>상승</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>하락</span>
          <span className="text-[var(--color-down)] font-mono font-bold" style={{ fontSize: 'var(--text-title)' }}>{down}</span>
        </div>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-[var(--bg-elevated)] gap-0.5">
        <div className="rounded-l-full transition-all duration-700" style={{ width: `${upPct}%`, background: 'var(--color-up)' }} />
        <div className="rounded-r-full transition-all duration-700" style={{ width: `${downPct}%`, background: 'var(--color-down)' }} />
      </div>
      <div className="text-center">
        <span className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>보합 {flat}</span>
      </div>
    </div>
  )
}

export function MarketPulse({ data, breadth }: {
  data: MarketSummary; kospi?: unknown; kosdaq?: unknown; breadth?: BreadthDay[]
}) {
  const { latest, sparkline, signals, tradingValueRatio } = data
  const adrSpark = sparkline.map(s => s.adr)
  const tvSpark = sparkline.map(s => s.tradingValue)
  const tvRatio = tradingValueRatio ?? 0

  const lastBreadth = breadth?.[breadth.length - 1]

  return (
    <div>
      <SectionHeader title="시장 체온계" subtitle="Market Pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Left: Main metrics grid */}
        <div className="space-y-4">
          {/* Up/Down Ratio - the most visual element */}
          <Card>
            <UpDownBar up={latest.up} down={latest.down} flat={latest.flat} />
          </Card>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatTile
              label="ADR"
              value={latest.adr.toFixed(1)}
              signal={signals.adr}
              sparkData={adrSpark}
              sparkColor={signals.adr === 'green' ? 'var(--color-up)' : signals.adr === 'red' ? 'var(--color-down)' : 'var(--signal-yellow)'}
            />
            <StatTile
              label="거래대금"
              value={latest.tradingValue.toFixed(1)}
              unit="조원"
              signal={signals.tradingValue}
              sparkData={tvSpark}
              sparkColor="var(--color-blue)"
            />
            <StatTile
              label="52주 신고가"
              value={lastBreadth ? `${lastBreadth.newHighs}` : '—'}
              unit="종목"
              signal={lastBreadth ? (
                lastBreadth.spread > 10 ? 'green' : lastBreadth.spread < -10 ? 'red' : 'yellow'
              ) : undefined}
            />
          </div>
        </div>

        {/* Right: Sidebar thermometer bars */}
        <Card className="flex flex-col gap-4">
          <h3 className="font-semibold text-[var(--text-tertiary)] uppercase tracking-wider" style={{ fontSize: 'var(--text-micro)' }}>
            상세 지표
          </h3>

          <ThermometerBar
            label="상승 비율"
            value={latest.up}
            max={latest.up + latest.down + latest.flat}
            color="var(--color-up)"
            subtext={`/ ${latest.up + latest.down + latest.flat}`}
          />

          <ThermometerBar
            label="ADR"
            value={parseFloat(latest.adr.toFixed(1))}
            max={200}
            color={signals.adr === 'green' ? 'var(--color-up)' : signals.adr === 'red' ? 'var(--color-down)' : 'var(--signal-yellow)'}
          />

          <ThermometerBar
            label="거래대금 비율"
            value={Math.round(tvRatio * 100)}
            max={200}
            color="var(--color-blue)"
            subtext="% (20일 평균 대비)"
          />

          {lastBreadth && (
            <>
              <ThermometerBar
                label="MA20 돌파율"
                value={parseFloat(lastBreadth.aboveMa20Pct.toFixed(1))}
                max={100}
                color="var(--chart-1)"
                subtext="%"
              />
              <ThermometerBar
                label="신고/저 스프레드"
                value={lastBreadth.spread}
                max={Math.max(Math.abs(lastBreadth.spread) * 2, 50)}
                color={lastBreadth.spread >= 0 ? 'var(--color-up)' : 'var(--color-down)'}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
