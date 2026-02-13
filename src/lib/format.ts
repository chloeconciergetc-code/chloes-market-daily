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
