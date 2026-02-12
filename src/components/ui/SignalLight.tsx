import type { Signal } from '../../types/market'

const colors: Record<Signal, string> = {
  green: 'bg-[var(--signal-green)]',
  yellow: 'bg-[var(--signal-yellow)]',
  red: 'bg-[var(--signal-red)]',
}

const glows: Record<Signal, string> = {
  green: 'shadow-[0_0_8px_var(--signal-green)]',
  yellow: 'shadow-[0_0_8px_var(--signal-yellow)]',
  red: 'shadow-[0_0_8px_var(--signal-red)]',
}

export function SignalLight({ signal }: { signal: Signal }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[signal]} ${glows[signal]}`} />
  )
}
