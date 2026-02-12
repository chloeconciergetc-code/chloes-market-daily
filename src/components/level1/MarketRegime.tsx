import { GlassCard } from '../ui/GlassCard'
import { SectionHeader } from '../ui/SectionHeader'
import type { MarketRegimeData } from '../../types/market'

const componentLabels: Record<string, string> = {
  adr: 'ADR (등락비율)',
  breadth: 'MA20 돌파율',
  hlSpread: '신고가/신저가',
  tradingValue: '거래대금',
  foreignFlow: '외국인 수급',
  volatility: '변동성 (역)',
}

const regimeColors: Record<string, string> = {
  'risk-on': 'var(--color-up)',
  'neutral-bullish': '#eab308',
  'neutral': 'var(--text-secondary)',
  'neutral-bearish': '#f97316',
  'risk-off': 'var(--color-down)',
}

function GaugeBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

export function MarketRegime({ data }: { data: MarketRegimeData }) {
  const color = regimeColors[data.regime] || 'var(--text-secondary)'
  const composite = data.composite ?? 50

  return (
    <div>
      <SectionHeader icon="🌡️" title="시장 체온 종합" subtitle="Market Regime" delay={0.04} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main gauge */}
        <GlassCard delay={0.06} className="lg:col-span-1 flex flex-col items-center justify-center py-6">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10"
                strokeDasharray={`${composite * 3.267} 326.7`}
                strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-bold" style={{ color }}>{composite.toFixed(0)}</span>
              <span className="text-[10px] text-[var(--text-tertiary)]">/ 100</span>
            </div>
          </div>
          <div className="mt-3 text-sm font-semibold" style={{ color }}>{data.label}</div>
        </GlassCard>

        {/* Components breakdown */}
        <GlassCard delay={0.1} className="lg:col-span-2">
          <div className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase mb-4">세부 지표</div>
          <div className="space-y-3">
            {Object.entries(data.components).map(([key, value]) => {
              const v = value ?? 50
              const barColor = v >= 60 ? 'var(--color-up)' : v >= 40 ? '#eab308' : 'var(--color-down)'
              const weight = data.weights[key] ?? 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-secondary)]">{componentLabels[key] || key}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--text-tertiary)]">{(weight * 100).toFixed(0)}%</span>
                      <span className="text-xs font-mono font-semibold" style={{ color: barColor }}>{v.toFixed(0)}</span>
                    </div>
                  </div>
                  <GaugeBar value={v} color={barColor} />
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
