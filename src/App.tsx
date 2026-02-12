import { useState, useEffect } from 'react'
import { useData } from './hooks/useMarketData'
import { IndexCandlestickChart } from './components/charts/IndexCandlestickChart'
import { IndexOverlayChart } from './components/charts/IndexOverlayChart'
import { MarketPulse } from './components/level1/MarketPulse'
import { MarketRegime } from './components/level1/MarketRegime'
import { BreadthSection } from './components/level2/BreadthChart'
import { InvestorFlow } from './components/level2/InvestorFlow'
import { ThemeMomentum } from './components/level2/ThemeMomentum'
import { SectorHeatmap } from './components/level2/SectorHeatmap'
import { NewHighTable } from './components/level3/NewHighTable'
import { NewLowTable } from './components/level3/NewLowTable'
import { Card } from './components/ui/Card'
import type { IndexChartData, MarketSummary, BreadthDay, ThemesData, ScannerStock, InvestorFlowData, MarketRegimeData } from './types/market'

function Header({ date }: { date?: string }) {
  return (
    <header className="text-center mb-6 pt-4">
      <h1 className="font-bold tracking-tight text-[var(--text-primary)]" style={{ fontSize: 'var(--text-display)' }}>
        Chloe's Market Daily
      </h1>
      {date && (
        <p className="text-[var(--text-secondary)] font-mono mt-1.5" style={{ fontSize: 'var(--text-caption)' }}>
          {date} · 15:30 장마감 기준
        </p>
      )}
      {!date && (
        <p className="text-[var(--text-tertiary)] font-mono mt-1.5" style={{ fontSize: 'var(--text-caption)' }}>
          데이터 로딩 중...
        </p>
      )}
    </header>
  )
}

const sections = [
  { id: 'section-regime', label: '시장체온' },
  { id: 'section-index', label: '지수' },
  { id: 'section-pulse', label: '펄스' },
  { id: 'section-investor', label: '수급' },
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
    <nav className="sticky top-0 z-50 bg-[var(--bg-base)]/95 backdrop-blur-sm border-b border-[var(--border-default)] -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-1 py-2.5 overflow-x-auto scrollbar-hide max-w-[1400px] mx-auto">
        {sections.map(s => (
          <button key={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className={`px-4 py-2 font-semibold rounded-[var(--radius-md)] whitespace-nowrap transition-all duration-200 ${
              active === s.id
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
            style={{ fontSize: 'var(--text-body)' }}>
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="text-center py-10 mt-6">
      <div className="h-px w-24 mx-auto bg-[var(--border-default)] mb-6" />
      <span className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-caption)' }}>Powered by Chloe 🫧</span>
    </footer>
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
  const investorFlow = useData<InvestorFlowData>('investor-flow.json')
  const regime = useData<MarketRegimeData>('market-regime.json')

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8 max-w-[1400px] mx-auto">
      <Header date={meta?.dataDate} />
      <SectionNav />

      {/* Level 1: Market Regime - TOP PRIORITY */}
      {regime && <div id="section-regime" className="mb-8 scroll-mt-16"><MarketRegime data={regime} /></div>}

      {/* Index Charts */}
      <div id="section-index" className="scroll-mt-16 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {kospi && (
            <Card>
              <IndexCandlestickChart data={kospi} label="KOSPI" />
            </Card>
          )}
          {kosdaq && (
            <Card>
              <IndexCandlestickChart data={kosdaq} label="KOSDAQ" />
            </Card>
          )}
        </div>
        {/* KOSPI vs KOSDAQ Overlay */}
        {kospi && kosdaq && (
          <div className="mt-4">
            <Card>
              <IndexOverlayChart kospi={kospi} kosdaq={kosdaq} />
            </Card>
          </div>
        )}
      </div>

      {/* Level 1: Market Pulse */}
      {summary && <div id="section-pulse" className="mb-8 scroll-mt-16"><MarketPulse data={summary} kospi={kospi ?? undefined} kosdaq={kosdaq ?? undefined} breadth={breadth ?? undefined} /></div>}

      {/* Level 2: Investor Flow */}
      {investorFlow && <div id="section-investor" className="mb-8 scroll-mt-16"><InvestorFlow data={investorFlow} /></div>}

      {/* Level 2: Breadth */}
      {breadth && <div id="section-breadth" className="mb-8 scroll-mt-16"><BreadthSection data={breadth} /></div>}

      {/* Level 2: Themes */}
      {themes && <div id="section-themes" className="mb-8 scroll-mt-16"><ThemeMomentum data={themes} /></div>}
      {themes && <div className="mb-8"><SectorHeatmap data={themes.heatmap} /></div>}

      {/* Level 3: Deep Dive */}
      {newHighs && <div id="section-newhigh" className="mb-8 scroll-mt-16"><NewHighTable data={newHighs} /></div>}
      {newLows && newLows.length > 0 && <div id="section-newlow" className="mb-8 scroll-mt-16"><NewLowTable data={newLows} /></div>}

      <Footer />
    </div>
  )
}
