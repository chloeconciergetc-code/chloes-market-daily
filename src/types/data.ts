export interface MarketSummary {
  date: string
  advances: number
  declines: number
  flat: number
  adr: number
  tradingValue: number
  sparkline: { d: string; adv: number; dec: number }[]
}

export interface Candle {
  d: string; o: number; h: number; l: number; c: number; v: number
  ma20?: number | null; ma60?: number | null
}

export interface IndexData {
  market: string; ticker: string; name: string
  candles: Candle[]
}

export interface BreadthDay {
  d: string; aboveMa20Pct: number; highs: number; lows: number
}

export interface ThemeStock {
  ticker: string; name: string; chg: number; cap: number
}

export interface Theme {
  id: string; name: string; avgChg: number; count: number; stocks: ThemeStock[]
}

export interface TreemapSector {
  name: string; cap: number; avgChg: number; count: number; stocks: ThemeStock[]
}

export interface ThemesData {
  date: string
  topThemes: Theme[]
  bottomThemes: Theme[]
  treemap: TreemapSector[]
}

export interface NewHighStock {
  ticker: string; name: string; close: number; chgPct: number
  volume: number; cap: number; sector: string; newHigh: number
}

export interface ScannerData {
  date: string; stocks: NewHighStock[]
}
