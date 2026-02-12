import { GlassCard } from '../ui/GlassCard'
import { SignalLight } from '../ui/SignalLight'
import { Sparkline } from '../ui/Sparkline'
import { SectionHeader } from '../ui/SectionHeader'
import type { MarketSummary, IndexChartData, BreadthDay } from '../../types/market'

function MetricCard({ title, value, unit, sub, signal, sparkData, sparkColor, delay = 0 }: {
  title: string; value: string; unit?: string; sub?: string; signal?: 'green' | 'yellow' | 'red'
  sparkData?: number[]; sparkColor?: string; delay?: number
}) {
  // Compute delta from last two sparkline values
  const delta = sparkData && sparkData.length >= 2
    ? sparkData[sparkData.length - 1] - sparkData[sparkData.length - 2]
    : null
  const hasDelta = delta !== null && !isNaN(delta) && delta !== 0

  return (
    <GlassCard delay={delay} className="flex flex-col justify-between min-h-[140px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)]">{title}</span>
        <div className="flex items-center gap-2">
          {hasDelta && (
            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
              delta! > 0 ? 'text-[var(--color-up)] bg-[var(--color-up-soft)]' : 'text-[var(--color-down)] bg-[var(--color-down-soft)]'
            }`}>
              {delta! > 0 ? '▲' : '▼'}{Math.abs(delta!).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          )}
          {signal && <SignalLight signal={signal} size="sm" />}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[32px] font-bold leading-none tracking-tight">{value}</span>
        {unit && <span className="text-xs text-[var(--text-tertiary)] font-medium">{unit}</span>}
      </div>
      {sub && <div className="text-[var(--text-secondary)] text-sm mt-1.5 leading-relaxed">{sub}</div>}
      {sparkData && sparkData.length > 0 && (
        <div className="mt-auto pt-3">
          <Sparkline data={sparkData} color={sparkColor} width={120} height={24} />
        </div>
      )}
    </GlassCard>
  )
}

function IndexCard({ label, data, delay = 0 }: { label: string; data: IndexChartData; delay?: number }) {
  const last = data.candles[data.candles.length - 1]
  const prev = data.candles[data.candles.length - 2]
  if (!last || !prev) return null

  const change = last.c - prev.c
  const changeRate = ((change) / prev.c) * 100
  const isUp = change >= 0
  const color = isUp ? 'var(--color-up)' : 'var(--color-down)'
  const arrow = isUp ? '▲' : '▼'

  return (
    <GlassCard delay={delay} className="flex flex-col justify-between min-h-[140px]">
      <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)] mb-2">{label}</span>
      <div className="font-mono text-[36px] font-bold leading-none tracking-tight" style={{ color }}>
        {last.c.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[16px] font-mono font-semibold" style={{ color }}>
        <span>{arrow} {Math.abs(change).toFixed(2)}</span>
        <span>({changeRate >= 0 ? '+' : ''}{changeRate.toFixed(2)}%)</span>
      </div>
      <div className="text-[var(--text-secondary)] text-sm mt-1.5">
        거래량 {last.v.toLocaleString()}
      </div>
    </GlassCard>
  )
}

export function MarketPulse({ data, kospi, kosdaq, breadth }: { data: MarketSummary; kospi?: IndexChartData; kosdaq?: IndexChartData; breadth?: BreadthDay[] }) {
  const { latest, sparkline, signals, tradingValueRatio } = data
  const adrSpark = sparkline.map(s => s.adr)
  const tvSpark = sparkline.map(s => s.tradingValue)
  const tvRatio = tradingValueRatio ?? 0

  return (
    <div>
      <SectionHeader icon="🌡️" title="시장 체온계" subtitle="Market Pulse" delay={0.08} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="상승 종목" value={latest.up.toLocaleString()} unit="종목" delay={0.1}
          sparkColor="var(--color-up)"
        />
        <MetricCard
          title="하락 종목" value={latest.down.toLocaleString()} unit="종목" delay={0.14}
          sparkColor="var(--color-down)"
        />
        <MetricCard
          title="ADR" value={latest.adr.toFixed(1)} delay={0.18}
          signal={signals.adr}
          sparkData={adrSpark}
          sparkColor={signals.adr === 'green' ? 'var(--color-up)' : signals.adr === 'red' ? 'var(--color-down)' : 'var(--signal-yellow)'}
        />
        <MetricCard
          title="거래대금" value={latest.tradingValue.toFixed(1)} unit="조원" delay={0.22}
          signal={signals.tradingValue}
          sub={tvRatio > 0 ? `20일 평균 대비 ${(tvRatio * 100).toFixed(0)}%` : undefined}
          sparkData={tvSpark}
          sparkColor="var(--color-blue)"
        />
        {data.tradingConcentration && (
          <MetricCard
            title="거래대금 집중도" delay={0.25}
            value={`${data.tradingConcentration.top10.toFixed(1)}%`}
            sub={`상위 10종목 | TOP 20: ${data.tradingConcentration.top20.toFixed(1)}%`}
            signal={data.tradingConcentration.top10 >= 50 ? 'red' : data.tradingConcentration.top10 >= 35 ? 'yellow' : 'green'}
          />
        )}
        <MetricCard
          title="52주 신고/저" delay={0.26}
          value={breadth ? `${breadth[breadth.length - 1]?.newHighs ?? 0}` : '—'}
          sub={breadth ? `신저가 ${breadth[breadth.length - 1]?.newLows ?? 0}종목` : undefined}
          signal={breadth ? (
            (breadth[breadth.length - 1]?.spread ?? 0) > 10 ? 'green' :
            (breadth[breadth.length - 1]?.spread ?? 0) < -10 ? 'red' : 'yellow'
          ) : undefined}
        />
      </div>

      {/* Index Cards */}
      {(kospi || kosdaq) && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {kospi && <IndexCard label="KOSPI" data={kospi} delay={0.3} />}
          {kosdaq && <IndexCard label="KOSDAQ" data={kosdaq} delay={0.34} />}
        </div>
      )}
    </div>
  )
}
