import { motion } from 'framer-motion'
import { useData } from './hooks/useMarketData'
import { IndexCandlestickChart } from './components/charts/IndexCandlestickChart'
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
      className="text-center mb-10 pt-4"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-up-soft)] border border-[var(--color-up)]/10 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-up)] animate-pulse" />
        <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-up)]">MARKET REPORT</span>
      </div>
      <h1 className="text-3xl md:text-[40px] font-bold tracking-tight leading-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
        Chloe's Market Daily
      </h1>
      {date && (
        <p className="text-[var(--text-tertiary)] text-sm mt-2 font-mono">{date}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
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
      {summary && <div className="mb-8"><MarketPulse data={summary} /></div>}

      {/* Level 2: Direction */}
      {breadth && <div className="mb-8"><BreadthSection data={breadth} /></div>}
      {themes && <div className="mb-8"><ThemeMomentum data={themes} /></div>}
      {themes && <div className="mb-8"><SectorHeatmap data={themes.heatmap} /></div>}

      {/* Level 3: Deep Dive */}
      {newHighs && <div className="mb-8"><NewHighTable data={newHighs} /></div>}

      <Footer />
    </div>
  )
}
