import { motion } from 'framer-motion'

interface Tab<T extends string> {
  key: T
  label: string
  count?: number
}

interface TabGroupProps<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (key: T) => void
  variant?: 'default' | 'colored'
  layoutId?: string
}

const colorMap = {
  up: { bg: 'var(--color-up-soft)', text: 'var(--color-up)' },
  down: { bg: 'var(--color-down-soft)', text: 'var(--color-down)' },
}

export function TabGroup<T extends string>({ tabs, active, onChange, variant = 'default', layoutId = 'tab-pill' }: TabGroupProps<T>) {
  return (
    <div className="flex items-center gap-1">
      {tabs.map(tab => {
        const isActive = active === tab.key
        const colored = variant === 'colored' && tab.key === 'down'
        const activeBg = colored ? colorMap.down.bg : tab.key === 'up' ? colorMap.up.bg : 'var(--color-accent-soft)'
        const activeText = colored ? colorMap.down.text : tab.key === 'up' ? colorMap.up.text : 'var(--color-accent)'

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="relative px-3.5 py-1.5 font-semibold rounded-[var(--radius-sm)] transition-colors duration-200 fs-caption"
            style={{
              color: isActive ? activeText : 'var(--text-tertiary)',
            }}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-[var(--radius-sm)]"
                style={{ background: activeBg }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">
              {tab.label}
              {tab.count != null && (
                <span className="ml-1 font-mono opacity-60">({tab.count})</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
