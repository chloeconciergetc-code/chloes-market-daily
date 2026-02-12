import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { SectionHeader } from '../ui/SectionHeader'
import { fmtNum, fmtMarketCap, fmtVolume } from '../../lib/format'
import type { ScannerStock } from '../../types/market'

const sortLabels = { marketCap: '시총', changePct: '등락률', volume: '거래량' } as const

export function NewHighTable({ data }: { data: ScannerStock[] }) {
  const [sortBy, setSortBy] = useState<'marketCap' | 'changePct' | 'volume'>('marketCap')

  const sorted = [...data].sort((a, b) => {
    if (sortBy === 'changePct') return b.changePct - a.changePct
    if (sortBy === 'volume') return b.volume - a.volume
    return b.marketCap - a.marketCap
  })

  return (
    <div>
      <SectionHeader icon="⭐" title="52주 신고가" subtitle={`${data.length}종목`} delay={0.48} />
      <GlassCard delay={0.5} noPad>
        {/* Sort buttons */}
        <div className="flex items-center justify-end gap-1 px-5 pt-4 pb-2">
          {(Object.keys(sortLabels) as Array<keyof typeof sortLabels>).map(key => (
            <button key={key} onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide uppercase rounded-lg transition-all duration-200 ${
                sortBy === key
                  ? 'bg-white/[0.08] text-white shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                  : 'text-white/55 hover:text-[var(--text-secondary)] hover:bg-white/[0.03]'
              }`}>
              {sortLabels[key]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)] bg-[var(--bg-surface)]">
                <th className="text-left py-2.5 px-5">종목</th>
                <th className="text-right py-2.5">종가</th>
                <th className="text-right py-2.5">등락률</th>
                <th className="text-right py-2.5 hidden md:table-cell">시총</th>
                <th className="text-right py-2.5 pr-5 hidden lg:table-cell">거래량</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 50).map((s, i) => (
                <motion.tr key={s.ticker}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * Math.min(i, 20) }}
                  className="border-t border-white/[0.03] hover:bg-white/[0.03] transition-colors duration-150 group">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)] group-hover:text-white transition-colors">{s.name}</span>
                      <span className="text-[9px] text-[var(--text-muted)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">{s.ticker}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono text-sm">{fmtNum(s.close)}원</td>
                  <td className={`py-3 text-right font-mono text-xs font-semibold ${s.changePct >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                    {s.changePct > 0 ? '+' : ''}{s.changePct.toFixed(1)}%
                  </td>
                  <td className="py-3 text-right text-[var(--text-tertiary)] font-mono text-xs hidden md:table-cell">
                    {fmtMarketCap(s.marketCap)}
                  </td>
                  <td className="py-3 text-right text-[var(--text-muted)] font-mono text-xs pr-5 hidden lg:table-cell">
                    {fmtVolume(s.volume)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
