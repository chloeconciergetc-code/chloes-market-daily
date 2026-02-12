import { GlassCard } from '../ui/GlassCard'
import { SectionHeader } from '../ui/SectionHeader'
import type { SectorPerf } from '../../types/market'

export function SectorPerformance({ data }: { data: SectorPerf[] }) {
  if (!data || !data.length) return null

  const sorted = [...data].sort((a, b) => b.changePercent - a.changePercent)
  const maxAbs = Math.max(...sorted.map(s => Math.abs(s.changePercent)), 0.5)

  return (
    <div id="section-sector">
      <SectionHeader icon="📊" title="섹터 로테이션" subtitle="Sector Performance" delay={0.35} />
      <GlassCard delay={0.37} noPad>
        <div className="overflow-x-auto px-5 py-4">
          <div className="space-y-2">
            {sorted.map((s, i) => {
              const pct = (Math.abs(s.changePercent) / maxAbs) * 100
              const isUp = s.changePercent >= 0
              return (
                <div key={s.name} className="flex items-center gap-3 group hover:bg-white/[0.02] rounded-lg px-2 py-1.5 transition-colors">
                  <span className="text-xs font-medium text-[var(--text-secondary)] w-20 shrink-0 text-right">{s.name}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-5 relative bg-white/[0.03] rounded overflow-hidden">
                      {isUp ? (
                        <div className="absolute left-1/2 top-0 h-full rounded-r transition-all duration-700"
                          style={{ width: `${pct / 2}%`, background: `rgba(0,230,118,${0.3 + 0.5 * (pct / 100)})` }} />
                      ) : (
                        <div className="absolute right-1/2 top-0 h-full rounded-l transition-all duration-700"
                          style={{ width: `${pct / 2}%`, background: `rgba(255,23,68,${0.3 + 0.5 * (pct / 100)})` }} />
                      )}
                    </div>
                  </div>
                  <span className={`font-mono text-xs font-semibold w-16 text-right ${isUp ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                    {isUp ? '+' : ''}{s.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono w-12 text-right hidden md:block">
                    {s.stockCount}종목
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
