import { GlassCard } from '../ui/GlassCard'
import { SignalLight } from '../ui/SignalLight'
import { Sparkline } from '../ui/Sparkline'
import type { MarketSummary } from '../../types/market'

function MetricCard({ title, value, sub, signal, sparkData, sparkColor, delay = 0 }: {
  title: string; value: string; sub?: string; signal?: 'green' | 'yellow' | 'red'
  sparkData?: number[]; sparkColor?: string; delay?: number
}) {
  return (
    <GlassCard delay={delay} className="min-w-[140px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[var(--text-tertiary)] text-xs">{title}</span>
        {signal && <SignalLight signal={signal} />}
      </div>
      <div className="font-mono text-2xl font-semibold mb-1">{value}</div>
      {sub && <div className="text-[var(--text-secondary)] text-xs">{sub}</div>}
      {sparkData && sparkData.length > 0 && (
        <div className="mt-2">
          <Sparkline data={sparkData} color={sparkColor} width={100} height={20} />
        </div>
      )}
    </GlassCard>
  )
}

export function MarketPulse({ data }: { data: MarketSummary }) {
  const { latest, sparkline, signals, tradingValueRatio, tradingValueAvg20d } = data
  const adrSpark = sparkline.map(s => s.adr)
  const tvSpark = sparkline.map(s => s.tradingValue)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <MetricCard
        title="상승" value={latest.up.toLocaleString()} delay={0.1}
        sub={`종목`}
        sparkColor="var(--color-up)"
      />
      <MetricCard
        title="하락" value={latest.down.toLocaleString()} delay={0.15}
        sub={`종목`}
        sparkColor="var(--color-down)"
      />
      <MetricCard
        title="ADR" value={latest.adr.toFixed(2)} delay={0.2}
        signal={signals.adr}
        sparkData={adrSpark}
        sparkColor={signals.adr === 'green' ? 'var(--color-up)' : signals.adr === 'red' ? 'var(--color-down)' : 'var(--signal-yellow)'}
      />
      <MetricCard
        title="거래대금" value={`${latest.tradingValue.toFixed(1)}조`} delay={0.25}
        signal={signals.tradingValue}
        sub={`20일평균 대비 ${(tradingValueRatio * 100).toFixed(0)}%`}
        sparkData={tvSpark}
        sparkColor="var(--color-ma20)"
      />
      <MetricCard
        title="52주 신고가" value="-" delay={0.3}
        sub="데이터 로딩 중"
      />
    </div>
  )
}
