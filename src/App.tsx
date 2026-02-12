import { motion } from 'framer-motion'
import { useData } from './hooks/useMarketData'
import { IndexCandlestickChart } from './components/charts/IndexCandlestickChart'
import { MarketPulse } from './components/level1/MarketPulse'
import { BreadthSection } from './components/level2/BreadthChart'
import { ThemeMomentum } from './components/level2/ThemeMomentum'
import { SectorHeatmap } from './components/level2/SectorHeatmap'
import { NewHighTable } from './components/level3/NewHighTable'
import type { IndexChartData, MarketSummary, BreadthDay, ThemesData, ScannerStock } from './types/market'

function Header({ date }: { date?: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <div className="text-[var(--color-up)] text-xs tracking-widest mb-2">📈 MARKET REPORT</div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">Chloe's Market Daily</h1>
      {date && <p className="text-[var(--text-tertiary)] text-sm">{date}</p>}
    </motion.header>
  )
}

function Footer() {
  return (
    <footer className="text-center py-8 text-[var(--text-tertiary)] text-xs">
      Powered by Chloe 🫧
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

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 max-w-[1400px] mx-auto">
      <Header date={meta?.dataDate} />

      {/* 최상단: 지수 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {kospi && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 bg-[var(--bg-card)] backdrop-blur border border-[var(--glass-border)]">
            <IndexCandlestickChart data={kospi} label="KOSPI" />
          </motion.div>
        )}
        {kosdaq && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="rounded-2xl p-5 bg-[var(--bg-card)] backdrop-blur border border-[var(--glass-border)]">
            <IndexCandlestickChart data={kosdaq} label="KOSDAQ" />
          </motion.div>
        )}
      </div>

      {/* Level 1: 시장 체온계 */}
      {summary && (
        <div className="mb-6">
          <MarketPulse data={summary} />
        </div>
      )}

      {/* Level 2: 방향 파악 */}
      {breadth && (
        <div className="mb-6">
          <BreadthSection data={breadth} />
        </div>
      )}

      {themes && (
        <div className="mb-6">
          <ThemeMomentum data={themes} />
        </div>
      )}

      {themes && (
        <div className="mb-6">
          <SectorHeatmap data={themes.heatmap} />
        </div>
      )}

      {/* Level 3: 딥다이브 */}
      {newHighs && (
        <div className="mb-6">
          <NewHighTable data={newHighs} />
        </div>
      )}

      <Footer />
    </div>
  )
}
