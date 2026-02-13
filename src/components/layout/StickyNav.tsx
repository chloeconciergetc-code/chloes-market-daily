import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useActiveSection } from '../../hooks/useActiveSection'

const sections = [
  { id: 'overview', label: '종합' },
  { id: 'charts', label: '차트' },
  { id: 'flow', label: '수급' },
  { id: 'themes', label: '테마' },
  { id: 'scanner', label: '스캐너' },
]

export function StickyNav() {
  const sectionIds = useMemo(() => sections.map(s => s.id), [])
  const active = useActiveSection(sectionIds)

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border-default)] -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8"
      style={{ background: 'rgba(10, 13, 20, 0.95)' }}
      role="navigation"
      aria-label="섹션 네비게이션"
    >
      <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide max-w-[var(--content-max)] mx-auto">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="relative px-4 py-2 font-semibold rounded-[var(--radius-sm)] whitespace-nowrap transition-colors duration-200 fs-caption"
            style={{
              color: active === s.id ? 'var(--color-accent)' : 'var(--text-tertiary)',
            }}
            aria-current={active === s.id ? 'true' : undefined}
          >
            {active === s.id && (
              <motion.div
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-[var(--radius-sm)]"
                style={{ background: 'var(--color-accent-soft)' }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{s.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
