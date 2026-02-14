import { useState } from 'react'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { TreemapChart } from '../charts/TreemapChart'
import { WicsHeatmapModal } from './WicsHeatmapModal'
import type { WicsHeatmapData, HeatmapStock } from '../../types/market'

function industriesToHeatmap(data: WicsHeatmapData): HeatmapStock[] {
  return data.industries.map(ind => ({
    name: ind.name,
    ticker: ind.code,
    value: ind.totalMarketCap,
    change: ind.avgChange,
    sector: '',
  }))
}

export function WicsHeatmapPreview({ data }: { data: WicsHeatmapData }) {
  const [modalOpen, setModalOpen] = useState(false)
  const heatmapData = industriesToHeatmap(data)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionHeader title="WICS 산업 히트맵" subtitle={`중분류 ${data.industries.length}개`} />
        <button
          onClick={() => setModalOpen(true)}
          className="px-3 py-1.5 rounded-[var(--radius-sm)] font-semibold fs-caption transition-colors duration-200"
          style={{
            color: 'var(--color-accent)',
            background: 'var(--color-accent-soft)',
          }}
        >
          상세보기
        </button>
      </div>
      <Card>
        <TreemapChart data={heatmapData} height={360} />
      </Card>
      {modalOpen && (
        <WicsHeatmapModal data={data} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
