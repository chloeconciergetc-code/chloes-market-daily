import { GlassCard } from '../ui/GlassCard'
import { SectionHeader } from '../ui/SectionHeader'
import type { ThemesData } from '../../types/market'

function BarFill({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100)
  return (
    <div className="relative w-20 h-[5px] rounded-full bg-white/[0.04] overflow-hidden">
      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
    </div>
  )
}

export function ThemeMomentum({ data }: { data: ThemesData }) {
  const maxChange = Math.max(...data.top10.map(t => Math.abs(t.changePercent)), 1)

  return (
    <div>
      <SectionHeader icon="🔥" title="주도 테마 TOP 10" subtitle={`전체 ${data.total}개 테마`} delay={0.38} />
      <GlassCard delay={0.4} noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">
                <th className="text-left py-3.5 px-5 w-8">#</th>
                <th className="text-left py-3.5">테마</th>
                <th className="text-right py-3.5 pr-3">등락률</th>
                <th className="text-center py-3.5 w-24 hidden sm:table-cell"></th>
                <th className="text-right py-3.5">동조율</th>
                <th className="text-right py-3.5 hidden md:table-cell">종목수</th>
                <th className="text-left py-3.5 pl-5 hidden lg:table-cell">대장주</th>
                <th className="w-5"></th>
              </tr>
            </thead>
            <tbody>
              {data.top10.map((t, i) => {
                const isUp = t.changePercent >= 0
                return (
                  <tr key={t.name}
                    className="border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-200 group">
                    <td className="py-3.5 px-5 font-mono text-[var(--text-muted)] text-xs">{i + 1}</td>
                    <td className="py-3.5">
                      <span className="font-medium text-[var(--text-primary)] group-hover:text-white transition-colors">{t.name}</span>
                    </td>
                    <td className="py-3.5 pr-3 text-right">
                      <span className={`font-mono text-xs font-semibold ${isUp ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                        {isUp ? '+' : ''}{t.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 hidden sm:table-cell">
                      <BarFill value={t.changePercent} max={maxChange}
                        color={isUp
                          ? `rgba(0, ${Math.round(180 + 75 * Math.min(Math.abs(t.changePercent) / maxChange, 1))}, ${Math.round(80 + 38 * Math.min(Math.abs(t.changePercent) / maxChange, 1))}, 1)`
                          : `rgba(255, ${Math.round(60 - 37 * Math.min(Math.abs(t.changePercent) / maxChange, 1))}, ${Math.round(100 - 32 * Math.min(Math.abs(t.changePercent) / maxChange, 1))}, 1)`
                        } />
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`font-mono text-xs ${
                        t.syncRate >= 70 ? 'text-[var(--color-up)]' :
                        t.syncRate <= 40 ? 'text-[var(--color-down)]' :
                        'text-[var(--text-secondary)]'
                      }`}>
                        {t.syncRate}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-[var(--text-tertiary)] font-mono text-xs hidden md:table-cell">{t.stockCount}</td>
                    <td className="py-3.5 pl-5 hidden lg:table-cell">
                      <span className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                        {t.topStocks.slice(0, 3).join(' · ')}
                      </span>
                    </td>
                    <td className="w-5"></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
