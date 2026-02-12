import { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { fmtNum, fmtMarketCap } from '../../lib/format'
import type { ScannerStock } from '../../types/market'

export function NewHighTable({ data }: { data: ScannerStock[] }) {
  const [sortBy, setSortBy] = useState<'marketCap' | 'changePct' | 'volume'>('marketCap')
  
  const sorted = [...data].sort((a, b) => {
    if (sortBy === 'changePct') return b.changePct - a.changePct
    if (sortBy === 'volume') return b.volume - a.volume
    return b.marketCap - a.marketCap
  })

  return (
    <GlassCard delay={0.5}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm text-[var(--text-secondary)]">
          ⭐ 52주 신고가 <span className="text-[var(--text-tertiary)]">총 {data.length}종목</span>
        </h3>
        <div className="flex gap-1">
          {(['marketCap', 'changePct', 'volume'] as const).map(key => (
            <button key={key} onClick={() => setSortBy(key)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                sortBy === key ? 'bg-white/10 text-white' : 'text-[var(--text-tertiary)] hover:text-white'
              }`}>
              {key === 'marketCap' ? '시총' : key === 'changePct' ? '등락률' : '거래량'}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--bg-base)]">
            <tr className="text-[var(--text-tertiary)] text-xs border-b border-white/5">
              <th className="text-left py-2">종목</th>
              <th className="text-right py-2">종가</th>
              <th className="text-right py-2">등락률</th>
              <th className="text-right py-2 hidden md:table-cell">시총</th>
              <th className="text-right py-2 hidden lg:table-cell">거래량</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 50).map(s => (
              <tr key={s.ticker} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                <td className="py-2">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">{s.ticker}</div>
                </td>
                <td className="py-2 text-right font-mono">{fmtNum(s.close)}</td>
                <td className={`py-2 text-right font-mono ${s.changePct >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                  {s.changePct > 0 ? '+' : ''}{s.changePct.toFixed(1)}%
                </td>
                <td className="py-2 text-right text-[var(--text-secondary)] font-mono hidden md:table-cell">
                  {fmtMarketCap(s.marketCap)}
                </td>
                <td className="py-2 text-right text-[var(--text-tertiary)] font-mono hidden lg:table-cell">
                  {fmtNum(s.volume)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
