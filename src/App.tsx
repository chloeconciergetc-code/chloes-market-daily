import { useState, useEffect } from 'react'
import { useData } from './hooks/useMarketData'
import { HeroDashboard } from './components/level1/HeroDashboard'
import { MarketPulse } from './components/level1/MarketPulse'
import { IndexCandlestickChart } from './components/charts/IndexCandlestickChart'
import { IndexOverlayChart } from './components/charts/IndexOverlayChart'
import { BreadthSection } from './components/level2/BreadthChart'
import { InvestorFlow } from './components/level2/InvestorFlow'
import { ThemeMomentum } from './components/level2/ThemeMomentum'
import { SectorHeatmap } from './components/level2/SectorHeatmap'
import { NewHighTable } from './components/level3/NewHighTable'
import { NewLowTable } from './components/level3/NewLowTable'
import { Card } from './components/ui/Card'
import type { IndexChartData, MarketSummary, BreadthDay, ThemesData, ScannerStock, InvestorFlowData, MarketRegimeData } from './types/market'

/* ── Header ── */
function Header({ date }: { date?: string }) {
  return (
    <header className="text-center mb-6 pt-6">
      <h1 className="font-bold tracking-tight text-[var(--text-primary)]" style={{ fontSize: 'var(--text-display)' }}>
        Chloe's Market Daily
      </h1>
      {date && (
        <p className="text-[var(--text-secondary)] font-mono mt-1.5" style={{ fontSize: 'var(--text-caption)' }}>
          {date} · 15:30 장마감 기준
        </p>
      )}
      {!date && (
        <p className="text-[var(--text-muted)] font-mono mt-1.5" style={{ fontSize: 'var(--text-caption)' }}>
          데이터 로딩 중...
        </p>
      )}
    </header>
  )
}

/* ── Nav ── */
const sections = [
  { id: 'section-hero', label: '종합' },
  { id: 'section-pulse', label: '체온계' },
  { id: 'section-index', label: '차트' },
  { id: 'section-investor', label: '수급' },
  { id: 'section-breadth', label: '시장폭' },
  { id: 'section-themes', label: '테마' },
  { id: 'section-scanner', label: '스캐너' },
]

function CompactNav() {
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
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border-default)] -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8"
      style={{ background: 'rgba(10, 13, 20, 0.92)' }}>
      <div className="flex items-center gap-1 py-2.5 overflow-x-auto scrollbar-hide max-w-[1200px] mx-auto">
        {sections.map(s => (
          <button key={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className={`relative px-3.5 py-1.5 font-semibold rounded-[var(--radius-sm)] whitespace-nowrap transition-all duration-200 ${
              active === s.id
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
            style={{ fontSize: 'var(--text-caption)' }}>
            {s.label}
            {active === s.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[var(--color-accent)]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="text-center py-10 mt-6">
      <div className="h-px w-12 mx-auto bg-[var(--border-default)] mb-4" />
      <span className="text-[var(--text-muted)]" style={{ fontSize: 'var(--text-micro)' }}>Powered by Chloe 🫧</span>
    </footer>
  )
}

/* ── App ── */
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
    <div className="min-h-screen px-4 py-4 md:px-6 lg:px-8 max-w-[1200px] mx-auto">
      <Header date={meta?.dataDate} />
      <CompactNav />

      <div className="space-y-8 mt-6">
        {/* Hero Dashboard */}
        {regime && (
          <section id="section-hero" className="scroll-mt-16 animate-fade-in">
            <HeroDashboard
              regime={regime}
              kospi={kospi ?? undefined}
              kosdaq={kosdaq ?? undefined}
              investorFlow={investorFlow ?? undefined}
            />
          </section>
        )}

        {/* Market Pulse (시장 체온계) */}
        {summary && (
          <section id="section-pulse" className="scroll-mt-16">
            <MarketPulse data={summary} breadth={breadth ?? undefined} />
          </section>
        )}

        {/* Index Charts */}
        <section id="section-index" className="scroll-mt-16">
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
          {kospi && kosdaq && (
            <div className="mt-4">
              <Card>
                <IndexOverlayChart kospi={kospi} kosdaq={kosdaq} />
              </Card>
            </div>
          )}
        </section>

        {/* Investor Flow */}
        {investorFlow && (
          <section id="section-investor" className="scroll-mt-16">
            <InvestorFlow data={investorFlow} />
          </section>
        )}

        {/* Breadth */}
        {breadth && (
          <section id="section-breadth" className="scroll-mt-16">
            <BreadthSection data={breadth} />
          </section>
        )}

        {/* Themes + Heatmap */}
        <section id="section-themes" className="scroll-mt-16">
          {themes && <ThemeMomentum data={themes} />}
          {themes && <div className="mt-4"><SectorHeatmap data={themes.heatmap} /></div>}
        </section>

        {/* Scanner */}
        <section id="section-scanner" className="scroll-mt-16">
          {newHighs && <NewHighTable data={newHighs} />}
          {newLows && newLows.length > 0 && <div className="mt-4"><NewLowTable data={newLows} /></div>}
        </section>
      </div>

      <Footer />
    </div>
  )
}
