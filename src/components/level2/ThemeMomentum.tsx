import { GlassCard } from '../ui/GlassCard'
import type { ThemesData } from '../../types/market'

export function ThemeMomentum({ data }: { data: ThemesData }) {
  return (
    <GlassCard delay={0.4}>
      <h3 className="text-sm text-[var(--text-secondary)] mb-3">
        🔥 주도 테마 TOP 10 <span className="text-[var(--text-tertiary)]">전체 {data.total}개 테마</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-tertiary)] text-xs border-b border-white/5">
              <th className="text-left py-2 pr-2">#</th>
              <th className="text-left py-2">테마</th>
              <th className="text-right py-2">등락률</th>
              <th className="text-right py-2">동조율</th>
              <th className="text-right py-2 hidden md:table-cell">종목수</th>
              <th className="text-left py-2 pl-4 hidden lg:table-cell">대장주</th>
            </tr>
          </thead>
          <tbody>
            {data.top10.map((t, i) => (
              <tr key={t.name} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                <td className="py-2.5 pr-2 font-mono text-[var(--text-tertiary)]">{i + 1}</td>
                <td className="py-2.5 font-medium">{t.name}</td>
                <td className={`py-2.5 text-right font-mono ${t.changePercent >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                  {t.changePercent > 0 ? '+' : ''}{t.changePercent.toFixed(2)}%
                </td>
                <td className="py-2.5 text-right font-mono">
                  <span className={t.syncRate >= 70 ? 'text-[var(--color-up)]' : t.syncRate <= 40 ? 'text-[var(--color-down)]' : 'text-[var(--text-secondary)]'}>
                    {t.syncRate}%
                  </span>
                </td>
                <td className="py-2.5 text-right text-[var(--text-tertiary)] hidden md:table-cell">{t.stockCount}</td>
                <td className="py-2.5 pl-4 text-[var(--text-secondary)] text-xs hidden lg:table-cell">
                  {t.topStocks.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
