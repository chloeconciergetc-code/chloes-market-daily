import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { TabGroup } from '../ui/TabGroup'
import { fmtNum, fmtMarketCap, fmtTradingValue } from '../../lib/format'
import type { ScannerStock } from '../../types/market'

type SortKey = 'marketCap' | 'changePct' | 'volume'
type Tab = 'high' | 'low'

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

function StockTable({ data, isHigh }: { data: ScannerStock[]; isHigh: boolean }) {
  const [sortBy, setSortBy] = useState<SortKey>('marketCap')

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === 'changePct') return isHigh ? b.changePct - a.changePct : a.changePct - b.changePct
      if (sortBy === 'volume') return (b.close * b.volume) - (a.close * a.volume)
      return b.marketCap - a.marketCap
    })
  }, [data, sortBy, isHigh])

  return (
    <div>
      <div className="flex items-center justify-end gap-1 px-4 pt-3 pb-2">
        {(Object.keys(sortLabels) as SortKey[]).map(key => (
          <SortButton key={key} label={sortLabels[key]} active={sortBy === key} onClick={() => setSortBy(key)} />
        ))}
      </div>

      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="font-semibold tracking-wider uppercase text-[var(--text-muted)] bg-[var(--bg-surface)] border-b border-[var(--border-default)] fs-micro">
              <th className="text-left py-2 px-4">종목</th>
              <th className="text-right py-2 min-w-[80px]">종가</th>
              <th className="text-right py-2">등락률</th>
              <th className="text-right py-2 hidden md:table-cell">시총</th>
              <th className="text-right py-2 pr-4 hidden lg:table-cell">거래금액</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 50).map((s, i) => (
              <tr key={s.ticker}
                className={`border-t border-[var(--border-default)]/30 hover:bg-[var(--bg-row-hover)] transition-colors group ${
                  i % 2 === 1 ? 'bg-[var(--bg-row-alt)]' : ''
                }`}>
                <td className="py-2 px-4 fs-body">
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
                <td className="py-2 text-right text-[var(--text-muted)] font-mono pr-4 hidden lg:table-cell fs-body">
                  {fmtTradingValue(s.close * s.volume)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ScannerSection({ newHighs, newLows }: {
  newHighs?: ScannerStock[]
  newLows?: ScannerStock[]
}) {
  const [tab, setTab] = useState<Tab>('high')

  if (!newHighs && !newLows) return null
  const hasLows = newLows && newLows.length > 0

  return (
    <div>
      <SectionHeader title="52주 스캐너" subtitle="Scanner" />
      <Card noPad>
        <div className="px-4 pt-4 pb-1 flex items-center justify-between">
          <TabGroup
            tabs={[
              { key: 'high' as Tab, label: '신고가', count: newHighs?.length },
              ...(hasLows ? [{ key: 'low' as Tab, label: '신저가', count: newLows?.length }] : []),
            ]}
            active={tab}
            onChange={setTab}
            variant="colored"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'high' && newHighs && <StockTable data={newHighs} isHigh={true} />}
            {tab === 'low' && newLows && <StockTable data={newLows} isHigh={false} />}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  )
}
