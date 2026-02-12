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
}

export interface ThemesData {
  top10: ThemeItem[]
  bottom10?: ThemeItem[]
  heatmap: { name: string; value: number; change: number }[]
  total: number
}

export interface ScannerStock {
  ticker: string
  name: string
  close: number
  changePct: number
  volume: number
  marketCap: number
  sector: string
}
