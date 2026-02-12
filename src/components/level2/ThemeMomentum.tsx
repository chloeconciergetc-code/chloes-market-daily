import { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { SectionHeader } from '../ui/SectionHeader'
import type { ThemesData, ThemeItem } from '../../types/market'

function BarFill({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100)
  return (
    <div className="relative w-20 h-[5px] rounded-full bg-white/[0.04] overflow-hidden">
      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
    </div>
  )
}

function ThemeTable({ items, isRising, maxChange }: { items: ThemeItem[]; isRising: boolean; maxChange: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
            <th className="text-left py-3.5 px-5 w-8">#</th>
            <th className="text-left py-3.5">테마</th>
            <th className="text-right py-3.5 pr-3">등락률</th>
            <th className="text-center py-3.5 w-24 hidden sm:table-cell"></th>
            <th className="text-right py-3.5">동조율</th>
            <th className="text-right py-3.5 hidden md:table-cell">거래집중</th>
            <th className="text-right py-3.5 hidden md:table-cell">종목수</th>
            <th className="text-left py-3.5 pl-5 hidden lg:table-cell">대장주</th>
            <th className="w-5"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((t, i) => {
            const isUp = t.changePercent >= 0
            return (
              <tr key={t.name}
                className={`border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-200 group ${
                  !isRising ? 'bg-[rgba(255,23,68,0.03)]' : ''
                }`}>
                <td className="py-3.5 px-5 font-mono text-[var(--text-muted)] text-xs">
                  <span>{i + 1}</span>
                  {t.prevRank != null && (
                    <span className={`ml-1 text-[9px] ${
                      t.prevRank > (i + 1) ? 'text-[var(--color-up)]' :
                      t.prevRank < (i + 1) ? 'text-[var(--color-down)]' :
                      'text-[var(--text-muted)]'
                    }`}>
                      {t.prevRank > (i + 1) ? `▲${t.prevRank - (i + 1)}` :
                       t.prevRank < (i + 1) ? `▼${(i + 1) - t.prevRank}` : '-'}
                    </span>
                  )}
                </td>
                <td className="py-3.5">
                  <span className="font-medium text-[var(--text-primary)] group-hover:text-white transition-colors">{t.name}</span>
                </td>
                <td className="py-3.5 pr-3 text-right">
                  <span className={`font-mono text-xs font-semibold ${isUp ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                    {isUp ? '+' : ''}{t.changePercent.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3.5 hidden sm:table-cell">
                  <BarFill value={t.changePercent} max={maxChange}
                    color={isUp
                      ? `rgba(0, ${Math.round(180 + 75 * Math.min(Math.abs(t.changePercent) / maxChange, 1))}, ${Math.round(80 + 38 * Math.min(Math.abs(t.changePercent) / maxChange, 1))}, 1)`
                      : `rgba(255, ${Math.round(60 - 37 * Math.min(Math.abs(t.changePercent) / maxChange, 1))}, ${Math.round(100 - 32 * Math.min(Math.abs(t.changePercent) / maxChange, 1))}, 1)`
                    } />
                </td>
                <td className="py-3.5 text-right">
                  <span className={`font-mono text-xs ${
                    t.syncRate >= 70 ? 'text-[var(--color-up)]' :
                    t.syncRate <= 40 ? 'text-[var(--color-down)]' :
                    'text-[var(--text-secondary)]'
                  }`}>
                    {t.syncRate}%
                  </span>
                </td>
                <td className="py-3.5 text-right font-mono text-xs hidden md:table-cell">
                  <span className={
                    (t.tradingValueConc ?? 0) >= 5 ? 'text-[var(--color-up)] font-semibold' :
                    (t.tradingValueConc ?? 0) >= 2 ? 'text-[var(--text-secondary)]' :
                    'text-[var(--text-muted)]'
                  }>
                    {t.tradingValueConc != null ? `${t.tradingValueConc}%` : '-'}
                  </span>
                </td>
                <td className="py-3.5 text-right text-[var(--text-tertiary)] font-mono text-xs hidden md:table-cell">{t.stockCount}</td>
                <td className="py-3.5 pl-5 hidden lg:table-cell">
                  <span className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                    {t.topStocks.slice(0, 3).join(' · ')}
                  </span>
                </td>
                <td className="w-5"></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ThemeMomentum({ data }: { data: ThemesData }) {
  const [tab, setTab] = useState<'up' | 'down'>('up')
  const hasBottom = data.bottom10 && data.bottom10.length > 0

  const items = tab === 'up' ? data.top10 : (data.bottom10 ?? [])
  const maxChange = Math.max(...items.map(t => Math.abs(t.changePercent)), 1)

  return (
    <div id="section-themes">
      <SectionHeader icon="🔥" title="주도 테마" subtitle={`전체 ${data.total}개 테마`} delay={0.38} />
      <GlassCard delay={0.4} noPad>
        {/* Tabs */}
        {hasBottom && (
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <button onClick={() => setTab('up')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                tab === 'up'
                  ? 'bg-[var(--color-up-soft)] text-[var(--color-up)]'
                  : 'text-white/55 hover:text-white/80 hover:bg-white/[0.03]'
              }`}>
              🚀 상승 테마 TOP 10
            </button>
            <button onClick={() => setTab('down')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                tab === 'down'
                  ? 'bg-[var(--color-down-soft)] text-[var(--color-down)]'
                  : 'text-white/55 hover:text-white/80 hover:bg-white/[0.03]'
              }`}>
              📉 하락 테마 TOP 10
            </button>
          </div>
        )}
        <ThemeTable items={items} isRising={tab === 'up'} maxChange={maxChange} />
      </GlassCard>
    </div>
  )
}
