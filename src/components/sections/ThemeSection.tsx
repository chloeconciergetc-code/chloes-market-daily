import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { TreemapChart } from '../charts/TreemapChart'
import { WicsHeatmapPreview } from './WicsHeatmapPreview'
import type { ThemesData, ThemeItem, WicsHeatmapData } from '../../types/market'

function ThemeTable({ items, isRising, label }: { items: ThemeItem[]; isRising: boolean; label: string }) {
  return (
    <Card noPad>
      <div className="px-5 pt-4 pb-2 md:px-6">
        <h3 className="font-semibold text-[var(--text-secondary)] fs-body">{label}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="font-semibold tracking-wider uppercase text-[var(--text-muted)] border-b border-[var(--border-default)] fs-micro">
              <th className="text-left py-2 px-4 md:px-6 w-10">#</th>
              <th className="text-left py-2">테마</th>
              <th className="text-right py-2 pr-3">등락률</th>
              <th className="text-right py-2">동조율</th>
              <th className="text-right py-2 hidden md:table-cell">거래집중</th>
              <th className="text-right py-2 hidden md:table-cell pr-4">종목수</th>
              <th className="text-left py-2 pl-6">대장주</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t, i) => {
              const isUp = t.changePercent >= 0
              return (
                <tr key={t.name}
                  className={`border-t border-[var(--border-default)]/40 transition-colors group ${
                    !isRising ? 'bg-[var(--color-down-soft)]/20' : ''
                  } ${i % 2 === 1 ? 'bg-[var(--bg-row-alt)]' : ''}`}
                  style={{ ['--tw-bg-opacity' as string]: 1 }}
                >
                  <td className="py-2 px-4 md:px-6 font-mono text-[var(--text-muted)] fs-caption">
                    <span>{i + 1}</span>
                    {t.prevRank != null && (
                      <span className={`ml-1 ${
                        t.prevRank > (i + 1) ? 'text-[var(--color-up)]' :
                        t.prevRank < (i + 1) ? 'text-[var(--color-down)]' :
                        'text-[var(--text-muted)]'
                      } fs-micro`}>
                        {t.prevRank > (i + 1) ? `▲${t.prevRank - (i + 1)}` :
                         t.prevRank < (i + 1) ? `▼${(i + 1) - t.prevRank}` : '-'}
                      </span>
                    )}
                  </td>
                  <td className="py-2 fs-body">
                    <span className="font-medium text-[var(--text-primary)] group-hover:text-white transition-colors">{t.name}</span>
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <span className={`font-mono font-semibold ${isUp ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'} fs-body`}>
                      {isUp ? '+' : ''}{t.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <span className={`font-mono ${
                      t.syncRate >= 70 ? 'text-[var(--color-up)]' :
                      t.syncRate <= 40 ? 'text-[var(--color-down)]' :
                      'text-[var(--text-secondary)]'
                    } fs-body`}>
                      {t.syncRate}%
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono hidden md:table-cell fs-body">
                    <span className={
                      (t.tradingValueConc ?? 0) >= 5 ? 'text-[var(--color-up)] font-semibold' :
                      (t.tradingValueConc ?? 0) >= 2 ? 'text-[var(--text-secondary)]' :
                      'text-[var(--text-muted)]'
                    }>
                      {t.tradingValueConc != null ? `${t.tradingValueConc}%` : '-'}
                    </span>
                  </td>
                  <td className="py-2 text-right text-[var(--text-tertiary)] font-mono hidden md:table-cell pr-4 fs-body">{t.stockCount}</td>
                  <td className="py-2 pl-6">
                    <span className="text-[var(--text-tertiary)] fs-caption">
                      {t.topStocks.slice(0, 2).join(' · ')}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function ThemeSection({ data, wicsData }: { data: ThemesData; wicsData?: WicsHeatmapData }) {
  const hasBottom = data.bottom10 && data.bottom10.length > 0

  return (
    <div className="space-y-4">
      <SectionHeader title="주도 산업군" subtitle={`전체 ${data.total}개 테마`} />

      {/* Top 10 and Bottom 10 as separate tables */}
      <ThemeTable items={data.top10} isRising={true} label="상승 TOP 10" />

      {hasBottom && (
        <ThemeTable items={data.bottom10!} isRising={false} label="하락 TOP 10" />
      )}

      {wicsData ? (
        <WicsHeatmapPreview data={wicsData} />
      ) : (
        <div>
          <SectionHeader title="종목 히트맵" subtitle="시가총액 기준" />
          <Card>
            <TreemapChart data={data.heatmap} height={360} />
          </Card>
        </div>
      )}
    </div>
  )
}
