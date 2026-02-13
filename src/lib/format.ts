export function fmtNum(n: number, decimals = 0): string {
  return n.toLocaleString('ko-KR', { maximumFractionDigits: decimals })
}

export function fmtPct(n: number): string {
  const prefix = n > 0 ? '+' : ''
  return `${prefix}${n.toFixed(2)}%`
}

export function fmtVolume(n: number): string {
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)}억`
  if (n >= 1e4) return `${(n / 1e4).toFixed(1)}만`
  return fmtNum(n)
}

export function fmtMarketCap(n: number): string {
  // n is in 억원
  if (n >= 10000) return `${(n / 10000).toFixed(1)}조`
  return `${fmtNum(n)}억`
}

export function fmtTradingValue(n: number): string {
  const eok = n / 1e8
  if (eok >= 10000) return `${(eok / 10000).toFixed(1)}조`
  if (eok >= 1) return `${eok.toFixed(0)}억`
  return `${(n / 1e4).toFixed(0)}만`
}

export function fmtDateLabel(dateStr: string): string {
  return dateStr.slice(5, 7) + '.' + dateStr.slice(8, 10)
}
