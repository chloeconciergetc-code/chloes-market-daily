import { motion } from 'framer-motion'
import { useData } from './hooks/useMarketData'
import { IndexCandlestickChart } from './components/charts/IndexCandlestickChart'
// import { IndexSummary } from './components/level1/IndexSummary'
import { MarketPulse } from './components/level1/MarketPulse'
import { BreadthSection } from './components/level2/BreadthChart'
import { ThemeMomentum } from './components/level2/ThemeMomentum'
import { SectorHeatmap } from './components/level2/SectorHeatmap'
import { NewHighTable } from './components/level3/NewHighTable'
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
    </motion.header>
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

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8 max-w-[1440px] mx-auto">
      <Header date={meta?.dataDate} />

      {/* Index Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
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
      {summary && <div className="mb-10"><MarketPulse data={summary} kospi={kospi ?? undefined} kosdaq={kosdaq ?? undefined} /></div>}

      {/* Level 2: Direction */}
      {breadth && <div className="mb-10"><BreadthSection data={breadth} /></div>}
      {themes && <div className="mb-10"><ThemeMomentum data={themes} /></div>}
      {themes && <div className="mb-10"><SectorHeatmap data={themes.heatmap} /></div>}

      {/* Level 3: Deep Dive */}
      {newHighs && <div className="mb-10"><NewHighTable data={newHighs} /></div>}

      <Footer />
    </div>
  )
}
