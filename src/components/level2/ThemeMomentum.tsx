import { useState } from 'react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import type { ThemesData, ThemeItem } from '../../types/market'

function BarFill({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100)
  return (
    <div className="relative w-16 h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function ThemeTable({ items, isRising, maxChange }: { items: ThemeItem[]; isRising: boolean; maxChange: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="font-semibold tracking-wider uppercase text-[var(--text-muted)] border-b border-[var(--border-default)]" style={{ fontSize: 'var(--text-micro)' }}>
            <th className="text-left py-2.5 px-5 w-10">#</th>
            <th className="text-left py-2.5">테마</th>
            <th className="text-right py-2.5 pr-3">등락률</th>
            <th className="text-center py-2.5 w-20 hidden sm:table-cell"></th>
            <th className="text-right py-2.5">동조율</th>
            <th className="text-right py-2.5 hidden md:table-cell">거래집중</th>
            <th className="text-right py-2.5 hidden md:table-cell">종목수</th>
            <th className="text-left py-2.5 pl-5 hidden lg:table-cell">대장주</th>
          </tr>
        </thead>
        <tbody>
          {items.map((t, i) => {
            const isUp = t.changePercent >= 0
            return (
              <tr key={t.name}
                className={`border-t border-[var(--border-default)]/40 hover:bg-[var(--bg-subtle)] transition-colors group ${
                  !isRising ? 'bg-[var(--color-down-soft)]/20' : ''
                }`}>
                <td className="py-2.5 px-5 font-mono text-[var(--text-muted)]" style={{ fontSize: 'var(--text-caption)' }}>
                  <span>{i + 1}</span>
                  {t.prevRank != null && (
                    <span className={`ml-1 ${
                      t.prevRank > (i + 1) ? 'text-[var(--color-up)]' :
                      t.prevRank < (i + 1) ? 'text-[var(--color-down)]' :
                      'text-[var(--text-muted)]'
                    }`} style={{ fontSize: 'var(--text-micro)' }}>
                      {t.prevRank > (i + 1) ? `▲${t.prevRank - (i + 1)}` :
                       t.prevRank < (i + 1) ? `▼${(i + 1) - t.prevRank}` : '-'}
                    </span>
                  )}
                </td>
                <td className="py-2.5" style={{ fontSize: 'var(--text-body)' }}>
                  <span className="font-medium text-[var(--text-primary)] group-hover:text-white transition-colors">{t.name}</span>
                </td>
                <td className="py-2.5 pr-3 text-right">
                  <span className={`font-mono font-semibold ${isUp ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`} style={{ fontSize: 'var(--text-body)' }}>
                    {isUp ? '+' : ''}{t.changePercent.toFixed(2)}%
                  </span>
                </td>
                <td className="py-2.5 hidden sm:table-cell">
                  <BarFill value={t.changePercent} max={maxChange} color={isUp ? 'var(--color-up)' : 'var(--color-down)'} />
                </td>
                <td className="py-2.5 text-right">
                  <span className={`font-mono ${
                    t.syncRate >= 70 ? 'text-[var(--color-up)]' :
                    t.syncRate <= 40 ? 'text-[var(--color-down)]' :
                    'text-[var(--text-secondary)]'
                  }`} style={{ fontSize: 'var(--text-body)' }}>
                    {t.syncRate}%
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono hidden md:table-cell" style={{ fontSize: 'var(--text-body)' }}>
                  <span className={
                    (t.tradingValueConc ?? 0) >= 5 ? 'text-[var(--color-up)] font-semibold' :
                    (t.tradingValueConc ?? 0) >= 2 ? 'text-[var(--text-secondary)]' :
                    'text-[var(--text-muted)]'
                  }>
                    {t.tradingValueConc != null ? `${t.tradingValueConc}%` : '-'}
                  </span>
                </td>
                <td className="py-2.5 text-right text-[var(--text-tertiary)] font-mono hidden md:table-cell" style={{ fontSize: 'var(--text-body)' }}>{t.stockCount}</td>
                <td className="py-2.5 pl-5 hidden lg:table-cell">
                  <span className="text-[var(--text-tertiary)]" style={{ fontSize: 'var(--text-caption)' }}>
                    {t.topStocks.slice(0, 3).join(' · ')}
                  </span>
                </td>
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
    <div>
      <SectionHeader title="주도 테마" subtitle={`전체 ${data.total}개 테마`} />
      <Card noPad>
        {hasBottom && (
          <div className="flex items-center gap-1 px-5 pt-4 pb-2">
            <button onClick={() => setTab('up')}
              className={`px-3 py-1.5 font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
                tab === 'up'
                  ? 'bg-[var(--color-up-soft)] text-[var(--color-up)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
              style={{ fontSize: 'var(--text-caption)' }}>
              🚀 상승 TOP 10
            </button>
            <button onClick={() => setTab('down')}
              className={`px-3 py-1.5 font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
                tab === 'down'
                  ? 'bg-[var(--color-down-soft)] text-[var(--color-down)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
              style={{ fontSize: 'var(--text-caption)' }}>
              📉 하락 TOP 10
            </button>
          </div>
        )}
        <ThemeTable items={items} isRising={tab === 'up'} maxChange={maxChange} />
      </Card>
    </div>
  )
}
