import { useState } from 'react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { fmtNum, fmtMarketCap, fmtVolume } from '../../lib/format'
import type { ScannerStock } from '../../types/market'

const sortOptions = { marketCap: '시총', changePct: '등락률', volume: '거래량' } as const
type SortKey = keyof typeof sortOptions

function SortButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 font-semibold tracking-wide uppercase rounded-[var(--radius-sm)] transition-all duration-200 ${
        active ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
      }`}
      style={{ fontSize: 'var(--text-micro)' }}>
      {label}{active ? ' ▼' : ''}
    </button>
  )
}

export function NewHighTable({ data }: { data: ScannerStock[] }) {
  const [sortBy, setSortBy] = useState<SortKey>('marketCap')

  const sorted = [...data].sort((a, b) => {
    if (sortBy === 'changePct') return b.changePct - a.changePct
    if (sortBy === 'volume') return b.volume - a.volume
    return b.marketCap - a.marketCap
  })

  return (
    <div>
      <SectionHeader title="52주 신고가" subtitle={`${data.length}종목`} />
      <Card noPad>
        <div className="flex items-center justify-end gap-1 px-5 pt-4 pb-3">
          {(Object.keys(sortOptions) as SortKey[]).map(key => (
            <SortButton key={key} label={sortOptions[key]} active={sortBy === key} onClick={() => setSortBy(key)} />
          ))}
        </div>

        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="font-semibold tracking-wider uppercase text-[var(--text-muted)] bg-[var(--bg-surface)] border-b border-[var(--border-default)]" style={{ fontSize: 'var(--text-micro)' }}>
                <th className="text-left py-2.5 px-5">종목</th>
                <th className="text-right py-2.5 min-w-[90px]">종가</th>
                <th className="text-right py-2.5">등락률</th>
                <th className="text-right py-2.5 hidden md:table-cell">시총</th>
                <th className="text-right py-2.5 hidden lg:table-cell">거래량</th>
                <th className="text-right py-2.5 pr-5 hidden xl:table-cell">Vol배율</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 50).map((s) => (
                <tr key={s.ticker}
                  className="border-t border-[var(--border-default)]/30 hover:bg-[var(--bg-subtle)] transition-colors group">
                  <td className="py-2.5 px-5" style={{ fontSize: 'var(--text-body)' }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[var(--text-primary)] group-hover:text-white transition-colors">{s.name}</span>
                      {s.sector && <span className="bg-[var(--bg-elevated)] text-[var(--text-tertiary)] rounded-full px-1.5 py-0.5" style={{ fontSize: 'var(--text-micro)' }}>{s.sector}</span>}
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-mono text-[var(--text-secondary)]" style={{ fontSize: 'var(--text-body)' }}>{fmtNum(s.close)}원</td>
                  <td className={`py-2.5 text-right font-mono font-semibold ${s.changePct >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`} style={{ fontSize: 'var(--text-body)' }}>
                    {s.changePct > 0 ? '+' : ''}{s.changePct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-right text-[var(--text-tertiary)] font-mono hidden md:table-cell" style={{ fontSize: 'var(--text-body)' }}>
                    {fmtMarketCap(s.marketCap)}
                  </td>
                  <td className="py-2.5 text-right text-[var(--text-muted)] font-mono hidden lg:table-cell" style={{ fontSize: 'var(--text-body)' }}>
                    {fmtVolume(s.volume)}
                  </td>
                  <td className={`py-2.5 text-right font-mono pr-5 hidden xl:table-cell font-semibold ${
                    s.volRatio && s.volRatio >= 3 ? 'text-[var(--color-up)]' :
                    s.volRatio && s.volRatio >= 1.5 ? 'text-[var(--text-secondary)]' :
                    'text-[var(--text-muted)]'
                  }`} style={{ fontSize: 'var(--text-body)' }}>
                    {s.volRatio != null ? `${s.volRatio}x` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
