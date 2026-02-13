export const CHART = {
  margin: { top: 16, right: 48, bottom: 24, left: 48 },
  grid: {
    stroke: 'rgba(255,255,255,0.03)',
    dasharray: '2 4',
  },
  axis: {
    fill: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
  },
  tooltip: {
    bg: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    radius: 'var(--radius-md)',
    shadow: 'var(--shadow-elevated)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    padding: '8px 12px',
  },
  refLine: {
    stroke: 'rgba(255,255,255,0.08)',
    strokeWidth: 1,
    dasharray: '4 4',
  },
  colors: {
    kospi: 'var(--chart-1)',
    kosdaq: 'var(--chart-3)',
    foreign: 'var(--chart-1)',
    institution: 'var(--chart-2)',
    individual: 'var(--chart-3)',
    ma20: 'var(--color-ma20)',
    ma60: 'var(--color-ma60)',
  },
} as const
