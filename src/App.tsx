import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useData } from './hooks/useMarketData'
import { IndexCandlestickChart } from './components/charts/IndexCandlestickChart'
// import { IndexSummary } from './components/level1/IndexSummary'
import { MarketPulse } from './components/level1/MarketPulse'
import { BreadthSection } from './components/level2/BreadthChart'
import { ThemeMomentum } from './components/level2/ThemeMomentum'
import { SectorHeatmap } from './components/level2/SectorHeatmap'
import { NewHighTable } from './components/level3/NewHighTable'
import { NewLowTable } from './components/level3/NewLowTable'
import { GlassCard } from './components/ui/GlassCard'
import type { IndexChartData, MarketSummary, BreadthDay, ThemesData, ScannerStock } from './types/market'

function Header({ date }: { date?: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="text-center mb-8 pt-4"
    >
      <div className="flex items-center justify-center gap-3 mb-1">
        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/10" />
        <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[var(--text-tertiary)]">MARKET REPORT</span>
        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/10" />
      </div>
      <h1 className="text-2xl md:text-[32px] font-bold tracking-tight leading-tight text-white/90">
        Chloe's Market Daily
      </h1>
      {date && (
        <p className="text-[var(--text-muted)] text-xs mt-1.5 font-mono tracking-wide">{date}</p>
      )}
      <p className="text-[var(--text-tertiary)] text-[11px] mt-1 font-mono">
        {date ? `${date} 15:30 장마감 기준` : '데이터 로딩 중...'}
      </p>
    </motion.header>
  )
}

const sections = [
  { id: 'section-index', label: '지수' },
  { id: 'section-pulse', label: '시장체온' },
  { id: 'section-breadth', label: '시장폭' },
  { id: 'section-themes', label: '테마' },
  { id: 'section-newhigh', label: '신고가' },
  { id: 'section-newlow', label: '신저가' },
]

function SectionNav() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-base)]/80 border-b border-white/[0.04] -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-1 py-2.5 overflow-x-auto scrollbar-hide max-w-[1440px] mx-auto">
        {sections.map(s => (
          <button key={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className={`px-4 py-2 text-[13px] font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${
              active === s.id
                ? 'bg-white/[0.12] text-white shadow-sm'
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
            }`}>
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="text-center py-10 mt-6"
    >
      <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
      <span className="text-xs text-[var(--text-muted)]">Powered by Chloe 🫧</span>
    </motion.footer>
  )
}

export default function App() {
  const meta = useData<{ dataDate: string }>('meta.json')
  const kospi = useData<IndexChartData>('index-kospi.json')
  const kosdaq = useData<IndexChartData>('index-kosdaq.json')
  const summary = useData<MarketSummary>('market-summary.json')
  const breadth = useData<BreadthDay[]>('breadth.json')
  const themes = useData<ThemesData>('themes.json')
  const newHighs = useData<ScannerStock[]>('scanner-newhigh.json')
  const newLows = useData<ScannerStock[]>('scanner-newlow.json')

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8 max-w-[1440px] mx-auto">
      <Header date={meta?.dataDate} />
      <SectionNav />

      {/* Index Charts */}
      <div id="section-index" className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-16 scroll-mt-16">
        {kospi && (
          <GlassCard delay={0.08}>
            <IndexCandlestickChart data={kospi} label="KOSPI" />
          </GlassCard>
        )}
        {kosdaq && (
          <GlassCard delay={0.12}>
            <IndexCandlestickChart data={kosdaq} label="KOSDAQ" />
          </GlassCard>
        )}
      </div>

      {/* Level 1: Market Pulse */}
      {summary && <div id="section-pulse" className="mb-16 scroll-mt-16"><MarketPulse data={summary} kospi={kospi ?? undefined} kosdaq={kosdaq ?? undefined} breadth={breadth ?? undefined} /></div>}

      {/* Level 2: Direction */}
      {breadth && <div id="section-breadth" className="mb-16 scroll-mt-16"><BreadthSection data={breadth} /></div>}
      {themes && <div className="mb-16"><ThemeMomentum data={themes} /></div>}
      {themes && <div className="mb-16"><SectorHeatmap data={themes.heatmap} /></div>}

      {/* Level 3: Deep Dive */}
      {newHighs && <div id="section-newhigh" className="mb-16 scroll-mt-16"><NewHighTable data={newHighs} /></div>}
      {newLows && newLows.length > 0 && <div id="section-newlow" className="mb-16 scroll-mt-16"><NewLowTable data={newLows} /></div>}

      <Footer />
    </div>
  )
}
