import { Card } from '../ui/Card'
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

const regimeConfig: Record<string, { color: string; bgColor: string; emoji: string }> = {
  'risk-on': { color: 'var(--color-up)', bgColor: 'var(--color-up-soft)', emoji: '🟢' },
  'neutral-bullish': { color: 'var(--color-yellow)', bgColor: 'var(--color-yellow-soft)', emoji: '🟡' },
  'neutral': { color: 'var(--text-secondary)', bgColor: 'var(--bg-elevated)', emoji: '⚪' },
  'neutral-bearish': { color: 'var(--color-orange)', bgColor: 'var(--color-orange-soft)', emoji: '🟠' },
  'risk-off': { color: 'var(--color-down)', bgColor: 'var(--color-down-soft)', emoji: '🔴' },
}

function GaugeRing({ value, color, size = 140 }: { value: number; color: string; size?: number }) {
  const r = (size - 16) / 2
  const circumference = 2 * Math.PI * r
  const progress = (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        {/* Progress */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold leading-none" style={{ fontSize: '2rem', color }}>{value.toFixed(0)}</span>
        <span className="text-[var(--text-muted)] font-mono mt-0.5" style={{ fontSize: 'var(--text-micro)' }}>/ 100</span>
      </div>
    </div>
  )
}

function ComponentBar({ label, value, weight, color }: { label: string; value: number; weight: number; color: string }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-body)' }}>{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-muted)] font-mono" style={{ fontSize: 'var(--text-label)' }}>{(weight * 100).toFixed(0)}%</span>
          <span className="font-mono font-semibold min-w-[2rem] text-right" style={{ fontSize: 'var(--text-body)', color }}>{value.toFixed(0)}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

export function MarketRegime({ data }: { data: MarketRegimeData }) {
  const { color, bgColor, emoji } = regimeConfig[data.regime] || regimeConfig['neutral']
  const composite = data.composite ?? 50

  return (
    <div>
      <SectionHeader title="시장 체온 종합" subtitle="Market Regime" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Score Card */}
        <Card className="lg:col-span-4 flex flex-col items-center justify-center py-8">
          <GaugeRing value={composite} color={color} size={160} />
          <div className="mt-4 flex items-center gap-2">
            <span style={{ fontSize: 'var(--text-headline)' }}>{emoji}</span>
            <span className="font-bold" style={{ fontSize: 'var(--text-headline)', color }}>{data.label}</span>
          </div>
          <div
            className="mt-2 px-4 py-1.5 rounded-full font-mono font-medium"
            style={{ fontSize: 'var(--text-label)', color, background: bgColor }}
          >
            {data.regime.replace(/-/g, ' ').toUpperCase()}
          </div>
        </Card>

        {/* Components Breakdown */}
        <Card className="lg:col-span-8">
          <h3 className="font-semibold text-[var(--text-primary)] mb-5" style={{ fontSize: 'var(--text-title)' }}>세부 지표</h3>
          <div className="space-y-4">
            {Object.entries(data.components).map(([key, value]) => {
              const v = value ?? 50
              const barColor = v >= 60 ? 'var(--color-up)' : v >= 40 ? 'var(--color-yellow)' : 'var(--color-down)'
              const weight = data.weights[key] ?? 0
              return (
                <ComponentBar key={key} label={componentLabels[key] || key} value={v} weight={weight} color={barColor} />
              )
            })}
          </div>

          {/* Quick Summary Row */}
          <div className="mt-6 pt-4 border-t border-[var(--border-default)] grid grid-cols-3 gap-4">
            {(() => {
              const entries = Object.entries(data.components)
              const bullish = entries.filter(([, v]) => (v ?? 50) >= 60).length
              const bearish = entries.filter(([, v]) => (v ?? 50) < 40).length
              const neutral = entries.length - bullish - bearish
              return (
                <>
                  <div className="text-center">
                    <div className="font-mono font-bold text-[var(--color-up)]" style={{ fontSize: 'var(--text-headline)' }}>{bullish}</div>
                    <div className="text-[var(--text-tertiary)]" style={{ fontSize: 'var(--text-label)' }}>강세 지표</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono font-bold text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-headline)' }}>{neutral}</div>
                    <div className="text-[var(--text-tertiary)]" style={{ fontSize: 'var(--text-label)' }}>중립</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono font-bold text-[var(--color-down)]" style={{ fontSize: 'var(--text-headline)' }}>{bearish}</div>
                    <div className="text-[var(--text-tertiary)]" style={{ fontSize: 'var(--text-label)' }}>약세 지표</div>
                  </div>
                </>
              )
            })()}
          </div>
        </Card>
      </div>
    </div>
  )
}
