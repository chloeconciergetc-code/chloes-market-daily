import marketData from './data/market-data.json'
import { HeroSection } from './components/HeroSection'
import { MarketSummary } from './components/MarketSummary'
import { HighStocksList } from './components/HighStocksList'
import { HighTrendChart } from './components/HighTrendChart'
import { ThemeLeaders } from './components/ThemeLeaders'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="gradient-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <HeroSection date={marketData.marketSummary.date} />
        <MarketSummary data={marketData.marketSummary} />
        <HighTrendChart data={marketData.highTrend} />
        <HighStocksList stocks={marketData.highStocks} />
        <ThemeLeaders themes={marketData.themes} />
        <Footer />
      </div>
    </div>
  )
}

export default App
