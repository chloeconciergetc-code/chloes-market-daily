import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { IndexCandlestickChart } from '../charts/IndexCandlestickChart'
import { IndexOverlayChart } from '../charts/IndexOverlayChart'
import type { IndexChartData } from '../../types/market'

export function PriceCharts({ kospi, kosdaq }: {
  kospi?: IndexChartData
  kosdaq?: IndexChartData
}) {
  if (!kospi && !kosdaq) return null

  return (
    <div className="space-y-4">
      <SectionHeader title="지수 차트" subtitle="Price Action" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {kospi && (
          <Card>
            <IndexCandlestickChart data={kospi} label="KOSPI" height={280} />
          </Card>
        )}
        {kosdaq && (
          <Card>
            <IndexCandlestickChart data={kosdaq} label="KOSDAQ" height={280} />
          </Card>
        )}
      </div>
      {kospi && kosdaq && (
        <Card>
          <IndexOverlayChart kospi={kospi} kosdaq={kosdaq} height={240} />
        </Card>
      )}
    </div>
  )
}
