import { useData } from './hooks/useMarketData'
import { Header } from './components/layout/Header'
import { SidebarNav, MobileNav } from './components/layout/StickyNav'
import { Footer } from './components/layout/Footer'
import { SectionWrapper } from './components/layout/SectionWrapper'
import { RegimeOverview } from './components/sections/RegimeOverview'
import { PriceCharts } from './components/sections/PriceCharts'
import { FlowSection } from './components/sections/FlowSection'
import { ThemeSection } from './components/sections/ThemeSection'
import { ScannerSection } from './components/sections/ScannerSection'
import type { IndexChartData, MarketSummary, BreadthDay, ThemesData, ScannerStock, InvestorFlowData, MarketRegimeData, WicsHeatmapData } from './types/market'

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
  const wicsHeatmap = useData<WicsHeatmapData>('wics-heatmap.json')

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar navigation */}
      <SidebarNav />

      {/* Main content area — offset for sidebar on desktop */}
      <div className="lg:ml-[180px]">
        <div className="px-4 py-4 md:px-6 max-w-[var(--content-max)] mx-auto">
          <Header date={meta?.dataDate} />
          <MobileNav />

          <main className="flex flex-col mt-6" style={{ gap: 'var(--section-gap)' }}>
            {regime && (
              <SectionWrapper id="overview">
                <RegimeOverview
                  regime={regime}
                  kospi={kospi ?? undefined}
                  kosdaq={kosdaq ?? undefined}
                  summary={summary ?? undefined}
                  breadth={breadth ?? undefined}
                />
              </SectionWrapper>
            )}

            <SectionWrapper id="charts">
              <PriceCharts
                kospi={kospi ?? undefined}
                kosdaq={kosdaq ?? undefined}
              />
            </SectionWrapper>

            <SectionWrapper id="flow">
              <FlowSection
                investorFlow={investorFlow ?? undefined}
                breadth={breadth ?? undefined}
              />
            </SectionWrapper>

            {themes && (
              <SectionWrapper id="themes">
                <ThemeSection data={themes} wicsData={wicsHeatmap ?? undefined} />
              </SectionWrapper>
            )}

            <SectionWrapper id="scanner">
              <ScannerSection
                newHighs={newHighs ?? undefined}
                newLows={newLows ?? undefined}
              />
            </SectionWrapper>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  )
}
