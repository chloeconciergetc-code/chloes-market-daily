import type { Signal } from '../../types/market'

const config: Record<Signal, string> = {
  green: 'var(--signal-green)',
  yellow: 'var(--signal-yellow)',
  red: 'var(--signal-red)',
}

export function SignalLight({ signal, size = 'md' }: { signal: Signal; size?: 'sm' | 'md' }) {
  const color = config[signal]
  const dim = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
  return (
    <span
      className={`inline-block ${dim} rounded-full`}
      style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
    />
  )
}
