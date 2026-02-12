import { Card } from '../ui/Card'
import { SignalLight } from '../ui/SignalLight'
import { Sparkline } from '../ui/Sparkline'
import { SectionHeader } from '../ui/SectionHeader'
import type { MarketSummary, IndexChartData, BreadthDay } from '../../types/market'

function MetricCard({ title, value, unit, sub, signal, sparkData, sparkColor }: {
  title: string; value: string; unit?: string; sub?: string; signal?: 'green' | 'yellow' | 'red'
  sparkData?: number[]; sparkColor?: string
}) {
  const delta = sparkData && sparkData.length >= 2
    ? sparkData[sparkData.length - 1] - sparkData[sparkData.length - 2]
    : null
  const hasDelta = delta !== null && !isNaN(delta) && delta !== 0

  return (
    <Card className="flex flex-col justify-between min-h-[130px]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold tracking-wide uppercase text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-label)' }}>{title}</span>
        <div className="flex items-center gap-2">
          {hasDelta && (
            <span className={`font-mono font-semibold px-1.5 py-0.5 rounded ${
              delta! > 0 ? 'text-[var(--color-up)] bg-[var(--color-up-soft)]' : 'text-[var(--color-down)] bg-[var(--color-down-soft)]'
            }`} style={{ fontSize: 'var(--text-micro)' }}>
              {delta! > 0 ? '▲' : '▼'}{Math.abs(delta!).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          )}
          {signal && <SignalLight signal={signal} size="sm" />}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono font-bold leading-none tracking-tight" style={{ fontSize: '1.75rem' }}>{value}</span>
        {unit && <span className="text-[var(--text-tertiary)] font-medium" style={{ fontSize: 'var(--text-label)' }}>{unit}</span>}
      </div>
      {sub && <div className="text-[var(--text-secondary)] mt-1.5 leading-relaxed" style={{ fontSize: 'var(--text-body)' }}>{sub}</div>}
      {sparkData && sparkData.length > 0 && (
        <div className="mt-auto pt-3">
          <Sparkline data={sparkData} color={sparkColor} width={120} height={24} />
        </div>
      )}
    </Card>
  )
}

function IndexCard({ label, data }: { label: string; data: IndexChartData }) {
  const last = data.candles[data.candles.length - 1]
  const prev = data.candles[data.candles.length - 2]
  if (!last || !prev) return null

  const change = last.c - prev.c
  const changeRate = ((change) / prev.c) * 100
  const isUp = change >= 0
  const color = isUp ? 'var(--color-up)' : 'var(--color-down)'
  const arrow = isUp ? '▲' : '▼'

  return (
    <Card className="flex flex-col justify-between min-h-[130px]">
      <span className="font-semibold tracking-wide uppercase text-[var(--text-secondary)] mb-2" style={{ fontSize: 'var(--text-label)' }}>{label}</span>
      <div className="font-mono font-bold leading-none tracking-tight" style={{ fontSize: '2rem', color }}>
        {last.c.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="flex items-center gap-2 mt-2 font-mono font-semibold" style={{ color, fontSize: 'var(--text-body)' }}>
        <span>{arrow} {Math.abs(change).toFixed(2)}</span>
        <span>({changeRate >= 0 ? '+' : ''}{changeRate.toFixed(2)}%)</span>
      </div>
      <div className="text-[var(--text-secondary)] mt-1.5" style={{ fontSize: 'var(--text-body)' }}>
        거래량 {last.v.toLocaleString()}
      </div>
    </Card>
  )
}

export function MarketPulse({ data, kospi, kosdaq, breadth }: { data: MarketSummary; kospi?: IndexChartData; kosdaq?: IndexChartData; breadth?: BreadthDay[] }) {
  const { latest, sparkline, signals, tradingValueRatio } = data
  const adrSpark = sparkline.map(s => s.adr)
  const tvSpark = sparkline.map(s => s.tradingValue)
  const tvRatio = tradingValueRatio ?? 0

  return (
    <div>
      <SectionHeader title="시장 체온계" subtitle="Market Pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="상승 종목" value={latest.up.toLocaleString()} unit="종목" sparkColor="var(--color-up)" />
        <MetricCard title="하락 종목" value={latest.down.toLocaleString()} unit="종목" sparkColor="var(--color-down)" />
        <MetricCard
          title="ADR" value={latest.adr.toFixed(1)} signal={signals.adr}
          sparkData={adrSpark}
          sparkColor={signals.adr === 'green' ? 'var(--color-up)' : signals.adr === 'red' ? 'var(--color-down)' : 'var(--signal-yellow)'}
        />
        <MetricCard
          title="거래대금" value={latest.tradingValue.toFixed(1)} unit="조원" signal={signals.tradingValue}
          sub={tvRatio > 0 ? `20일 평균 대비 ${(tvRatio * 100).toFixed(0)}%` : undefined}
          sparkData={tvSpark} sparkColor="var(--color-blue)"
        />
        <MetricCard
          title="52주 신고/저"
          value={breadth ? `${breadth[breadth.length - 1]?.newHighs ?? 0}` : '—'}
          sub={breadth ? `신저가 ${breadth[breadth.length - 1]?.newLows ?? 0}종목` : undefined}
          signal={breadth ? (
            (breadth[breadth.length - 1]?.spread ?? 0) > 10 ? 'green' :
            (breadth[breadth.length - 1]?.spread ?? 0) < -10 ? 'red' : 'yellow'
          ) : undefined}
        />
      </div>

      {(kospi || kosdaq) && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {kospi && <IndexCard label="KOSPI" data={kospi} />}
          {kosdaq && <IndexCard label="KOSDAQ" data={kosdaq} />}
        </div>
      )}
    </div>
  )
}
