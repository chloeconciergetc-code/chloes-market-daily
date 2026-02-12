import type { Signal } from '../../types/market'

const config: Record<Signal, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}

export function SignalLight({ signal, size = 'md' }: { signal: Signal; size?: 'sm' | 'md' }) {
  const bg = config[signal]
  const dim = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
  return (
    <span className={`inline-block ${dim} rounded-full ${bg}`} />
  )
}
