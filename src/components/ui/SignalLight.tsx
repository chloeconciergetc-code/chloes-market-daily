import type { Signal } from '../../types/market'

const config: Record<Signal, { bg: string; glow: string }> = {
  green: { bg: 'bg-emerald-400', glow: '0 0 10px rgba(0,230,118,0.5), 0 0 4px rgba(0,230,118,0.3)' },
  yellow: { bg: 'bg-yellow-400', glow: '0 0 10px rgba(255,214,0,0.5), 0 0 4px rgba(255,214,0,0.3)' },
  red: { bg: 'bg-red-500', glow: '0 0 10px rgba(255,23,68,0.5), 0 0 4px rgba(255,23,68,0.3)' },
}

export function SignalLight({ signal, size = 'md' }: { signal: Signal; size?: 'sm' | 'md' }) {
  const { bg, glow } = config[signal]
  const dim = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
  return (
    <span className={`relative inline-flex items-center justify-center`}>
      <span className={`${dim} rounded-full ${bg}`} style={{ boxShadow: glow }} />
      <span className={`absolute ${dim} rounded-full ${bg} animate-ping opacity-30`} />
    </span>
  )
}
