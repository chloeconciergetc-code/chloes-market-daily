import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TabGroup } from '../ui/TabGroup'
import { TreemapChart } from '../charts/TreemapChart'
import type { LayoutRect } from '../../lib/squarify'
import type { WicsHeatmapData, WicsIndustry, HeatmapStock } from '../../types/market'

type MarketFilter = '전체' | 'KOSPI' | 'KOSDAQ'

const marketTabs: { key: MarketFilter; label: string }[] = [
  { key: '전체', label: '전체' },
  { key: 'KOSPI', label: 'KOSPI' },
  { key: 'KOSDAQ', label: 'KOSDAQ' },
]

function filterByMarket(industries: WicsIndustry[], market: MarketFilter): WicsIndustry[] {
  if (market === '전체') return industries
  return industries
    .map(ind => {
      const filtered = ind.stocks.filter(s => s.market === market)
      if (filtered.length === 0) return null
      const totalCap = filtered.reduce((sum, s) => sum + s.marketCap, 0)
      const avgChange = totalCap > 0
        ? filtered.reduce((sum, s) => sum + s.change * s.marketCap, 0) / totalCap
        : 0
      return {
        ...ind,
        totalMarketCap: totalCap,
        avgChange: Math.round(avgChange * 100) / 100,
        stockCount: filtered.length,
        stocks: filtered,
      }
    })
    .filter((ind): ind is WicsIndustry => ind !== null)
}

function industriesToHeatmap(industries: WicsIndustry[]): HeatmapStock[] {
  return industries.map(ind => ({
    name: ind.name,
    ticker: ind.code,
    value: ind.totalMarketCap,
    change: ind.avgChange,
    sector: '',
  }))
}

function stocksToHeatmap(industry: WicsIndustry): HeatmapStock[] {
  return industry.stocks.map(s => ({
    name: s.name,
    ticker: s.ticker,
    value: s.marketCap,
    change: s.change,
    sector: industry.name,
  }))
}

function fmtCap(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`
  return `${v.toLocaleString()}억`
}

export function WicsHeatmapModal({ data, onClose }: { data: WicsHeatmapData; onClose: () => void }) {
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('전체')
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ESC key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Reset selection when market filter changes
  useEffect(() => {
    setSelectedIndustry(null)
  }, [marketFilter])

  const filteredIndustries = useMemo(
    () => filterByMarket(data.industries, marketFilter),
    [data.industries, marketFilter]
  )

  const industryHeatmap = useMemo(
    () => industriesToHeatmap(filteredIndustries),
    [filteredIndustries]
  )

  const selectedInd = useMemo(
    () => selectedIndustry ? filteredIndustries.find(i => i.code === selectedIndustry) : null,
    [filteredIndustries, selectedIndustry]
  )

  const stockHeatmap = useMemo(
    () => selectedInd ? stocksToHeatmap(selectedInd) : [],
    [selectedInd]
  )

  function handleIndustryClick(rect: LayoutRect) {
    setSelectedIndustry(prev => prev === rect.ticker ? null : rect.ticker)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />

        {/* Content */}
        <motion.div
          className="relative w-[calc(100vw-32px)] max-w-[1200px] max-h-[calc(100vh-48px)] overflow-y-auto rounded-[var(--radius-xl)]"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-elevated)',
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]"
            style={{ background: 'var(--bg-base)' }}
          >
            <div>
              <h2 className="font-bold text-[var(--text-primary)] fs-headline">WICS 산업 히트맵</h2>
              <p className="text-[var(--text-muted)] fs-micro mt-0.5">
                중분류 {filteredIndustries.length}개 산업 · 시가총액 기준
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Tabs + Breadcrumb */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <TabGroup
                tabs={marketTabs}
                active={marketFilter}
                onChange={setMarketFilter}
                layoutId="wics-modal-tab"
              />

              <div className="flex items-center gap-2 fs-caption">
                <button
                  onClick={() => setSelectedIndustry(null)}
                  className="font-medium transition-colors"
                  style={{
                    color: selectedIndustry ? 'var(--color-accent)' : 'var(--text-primary)',
                  }}
                >
                  전체 산업
                </button>
                {selectedInd && (
                  <>
                    <span className="text-[var(--text-muted)]">&gt;</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {selectedInd.name}
                      <span className="ml-1 font-mono text-[var(--text-muted)]">
                        ({selectedInd.stockCount}종목)
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Industry Treemap */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[var(--text-secondary)] fs-body">
                  산업별 시가총액
                </h3>
                <span className="text-[var(--text-muted)] font-mono fs-micro">
                  총 {fmtCap(filteredIndustries.reduce((sum, i) => sum + i.totalMarketCap, 0))}
                </span>
              </div>
              <div
                className="rounded-[var(--radius-md)] overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
              >
                <TreemapChart
                  data={industryHeatmap}
                  height={selectedIndustry ? 280 : 400}
                  onItemClick={handleIndustryClick}
                />
              </div>
            </div>

            {/* Stock Treemap (drill-down) */}
            <AnimatePresence mode="wait">
              {selectedInd && stockHeatmap.length > 0 && (
                <motion.div
                  key={selectedIndustry}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[var(--text-secondary)] fs-body">
                      {selectedInd.name}
                      <span className="ml-2 font-normal text-[var(--text-muted)] fs-caption">
                        개별 종목 ({selectedInd.stockCount})
                      </span>
                    </h3>
                    <span className="font-mono fs-micro" style={{
                      color: selectedInd.avgChange >= 0 ? 'var(--color-up)' : 'var(--color-down)',
                    }}>
                      {selectedInd.avgChange > 0 ? '+' : ''}{selectedInd.avgChange.toFixed(2)}%
                    </span>
                  </div>
                  <div
                    className="rounded-[var(--radius-md)] overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
                  >
                    <TreemapChart data={stockHeatmap} height={320} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
