import { motion } from 'framer-motion'
import clsx from 'clsx'

type Signal = 'bullish' | 'bearish' | 'neutral'

function getSignal(advances: number, declines: number): Signal {
  const ratio = advances / Math.max(declines, 1)
  if (ratio > 1.5) return 'bullish'
  if (ratio < 0.67) return 'bearish'
  return 'neutral'
}

const colors: Record<Signal, string> = {
  bullish: 'var(--color-up)',
  bearish: 'var(--color-down)',
  neutral: '#ffc107',
}

const labels: Record<Signal, string> = {
  bullish: '강세',
  bearish: '약세',
  neutral: '중립',
}

export default function SignalLight({ advances, declines }: { advances: number; declines: number }) {
  const signal = getSignal(advances, declines)
  const c = colors[signal]
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className={clsx('w-4 h-4 rounded-full')}
        style={{ background: c, boxShadow: `0 0 12px ${c}` }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="font-mono text-sm font-semibold" style={{ color: c }}>{labels[signal]}</span>
    </div>
  )
}
