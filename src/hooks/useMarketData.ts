import metaJson from '../data/meta.json'
import kospiJson from '../data/index-kospi.json'
import kosdaqJson from '../data/index-kosdaq.json'
import summaryJson from '../data/market-summary.json'
import breadthJson from '../data/breadth.json'
import themesJson from '../data/themes.json'
import newHighJson from '../data/scanner-newhigh.json'
import newLowJson from '../data/scanner-newlow.json'
import investorFlowJson from '../data/investor-flow.json'
import marketRegimeJson from '../data/market-regime.json'
import wicsHeatmapJson from '../data/wics-heatmap.json'

const dataMap: Record<string, unknown> = {
  'meta.json': metaJson,
  'index-kospi.json': kospiJson,
  'index-kosdaq.json': kosdaqJson,
  'market-summary.json': summaryJson,
  'breadth.json': breadthJson,
  'themes.json': themesJson,
  'scanner-newhigh.json': newHighJson,
  'scanner-newlow.json': newLowJson,
  'investor-flow.json': investorFlowJson,
  'market-regime.json': marketRegimeJson,
  'wics-heatmap.json': wicsHeatmapJson,
}

export function useData<T>(file: string): T | null {
  return (dataMap[file] as T) ?? null
}
