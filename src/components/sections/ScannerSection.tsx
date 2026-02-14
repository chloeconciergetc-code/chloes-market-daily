import { useState, useMemo } from 'react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { fmtNum, fmtMarketCap, fmtTradingValue } from '../../lib/format'
import type { ScannerStock } from '../../types/market'

type SortKey = 'marketCap' | 'changePct' | 'volume'

const sortLabels: Record<SortKey, string> = { marketCap: '시총', changePct: '등락률', volume: '거래금액' }

function SortButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-2 py-1 font-semibold tracking-wide rounded-[var(--radius-xs)] transition-all duration-200 fs-micro ${
        active ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
      }`}>
      {label}{active ? ' ▼' : ''}
    </button>
  )
}

function StockTable({ data, isHigh, label, count }: { data: ScannerStock[]; isHigh: boolean; label: string; count: number }) {
  const [sortBy, setSortBy] = useState<SortKey>('marketCap')

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'changePct') return isHigh ? b.changePct - a.changePct : a.changePct - b.changePct
      if (sortBy === 'volume') return (b.close * b.volume) - (a.close * a.volume)
      return b.marketCap - a.marketCap
    })
  }, [data, sortBy, isHigh])

  return (
    <Card noPad>
      <div className="flex items-center justify-between px-5 pt-4 pb-2 md:px-6">
        <h3 className="font-semibold text-[var(--text-secondary)] fs-body">
          {label} <span className="text-[var(--text-muted)] font-mono fs-micro">({count})</span>
        </h3>
        <div className="flex items-center gap-1">
          {(Object.keys(sortLabels) as SortKey[]).map(key => (
            <SortButton key={key} label={sortLabels[key]} active={sortBy === key} onClick={() => setSortBy(key)} />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="font-semibold tracking-wider uppercase text-[var(--text-muted)] bg-[var(--bg-surface)] border-b border-[var(--border-default)] fs-micro">
              <th className="text-left py-2 px-5 md:px-6">종목</th>
              <th className="text-right py-2 min-w-[80px]">종가</th>
              <th className="text-right py-2">등락률</th>
              <th className="text-right py-2 hidden md:table-cell">시총</th>
              <th className="text-right py-2 pr-5 md:pr-6 hidden lg:table-cell">거래금액</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 50).map((s, i) => (
              <tr key={s.ticker}
                className={`border-t border-[var(--border-default)]/30 hover:bg-[var(--bg-row-hover)] transition-colors group ${
                  i % 2 === 1 ? 'bg-[var(--bg-row-alt)]' : ''
                }`}>
                <td className="py-2 px-5 md:px-6 fs-body">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[var(--text-primary)] group-hover:text-white transition-colors">{s.name}</span>
                    {s.sector && <span className="bg-[var(--bg-elevated)] text-[var(--text-tertiary)] rounded-full px-1.5 py-0.5 fs-micro">{s.sector}</span>}
                  </div>
                </td>
                <td className="py-2 text-right font-mono text-[var(--text-secondary)] fs-body">{fmtNum(s.close)}원</td>
                <td className={`py-2 text-right font-mono font-semibold ${s.changePct >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'} fs-body`}>
                  {s.changePct > 0 ? '+' : ''}{s.changePct.toFixed(1)}%
                </td>
                <td className="py-2 text-right text-[var(--text-tertiary)] font-mono hidden md:table-cell fs-body">
                  {fmtMarketCap(s.marketCap)}
                </td>
                <td className="py-2 text-right text-[var(--text-muted)] font-mono pr-5 md:pr-6 hidden lg:table-cell fs-body">
                  {fmtTradingValue(s.close * s.volume)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function ScannerSection({ newHighs, newLows }: {
  newHighs?: ScannerStock[]
  newLows?: ScannerStock[]
}) {
  if (!newHighs && !newLows) return null

  return (
    <div>
      <SectionHeader title="52주 스캐너" subtitle="Scanner" />
      <div className="space-y-4">
        {newHighs && newHighs.length > 0 && (
          <StockTable data={newHighs} isHigh={true} label="신고가" count={newHighs.length} />
        )}
        {newLows && newLows.length > 0 && (
          <StockTable data={newLows} isHigh={false} label="신저가" count={newLows.length} />
        )}
      </div>
    </div>
  )
}
