export type Signal = 'green' | 'yellow' | 'red'

export interface Candle {
  d: string
  date: string
  o: number
  h: number
  l: number
  c: number
  v: number
}

export interface IndexChartData {
  candles: Candle[]
  ma20: number[]
  ma60: number[]
}

export interface DaySummary {
  date: string
  up: number
  down: number
  flat: number
  adr: number
  tradingValue: number
}

export interface MarketSummary {
  date: string
  latest: DaySummary
  sparkline: DaySummary[]
  tradingValueAvg20d: number
  tradingValueRatio: number
  signals: { adr: Signal; tradingValue: Signal }
  tradingConcentration?: { top10: number; top20: number }
}

export interface BreadthDay {
  date: string
  aboveMa20Pct: number
  newHighs: number
  newLows: number
  spread: number
}

export interface ThemeItem {
  rank: number
  name: string
  changePercent: number
  syncRate: number
  stockCount: number
  topStocks: string[]
  prevRank?: number | null        // Phase 2: 전일 순위
  tradingValueConc?: number       // Phase 2: 거래대금 집중도 (%)
  totalMarketCap?: number         // Phase 2: 테마 시총 합계
}

export interface SectorPerf {
  name: string
  changePercent: number
  totalMarketCap: number
  stockCount: number
}

export interface HeatmapStock {
  name: string
  ticker: string
  value: number       // 시가총액 (억원) — treemap 면적 기준
  change: number      // 등락률 %
  sector: string
}

export interface ThemesData {
  top10: ThemeItem[]
  bottom10?: ThemeItem[]
  heatmap: HeatmapStock[]
  total: number
  sectorPerformance?: SectorPerf[] // Phase 2: 섹터별 등락률
}

// Phase 3: Investor Flow
export interface InvestorFlowDay {
  date: string
  foreign: number      // 억원
  institution: number  // 억원
  individual: number   // 억원
  otherCorp: number    // 억원
}

export interface InvestorFlowData {
  kospi: InvestorFlowDay[]
  kosdaq: InvestorFlowDay[]
}

// Phase 3: Market Regime
export interface MarketRegimeData {
  date: string
  composite: number
  regime: string
  label: string
  components: Record<string, number>
  weights: Record<string, number>
}

// WICS Industry Classification
export interface WicsStock {
  ticker: string
  name: string
  marketCap: number       // 억원
  change: number          // daily change %
  market: 'KOSPI' | 'KOSDAQ'
  weight: number          // WICS 내 비중 %
}

export interface WicsIndustry {
  code: string            // "G2510"
  name: string            // "반도체와반도체장비"
  totalMarketCap: number  // 억원
  avgChange: number       // 시총 가중평균 등락률 %
  stockCount: number
  stocks: WicsStock[]     // 시총 내림차순 정렬
}

export interface WicsHeatmapData {
  date: string
  industries: WicsIndustry[]
}

export interface ScannerStock {
  ticker: string
  name: string
  close: number
  changePct: number
  volume: number
  marketCap: number
  sector: string
  volRatio?: number | null  // Phase 2: 거래량 / 20일 평균
}
