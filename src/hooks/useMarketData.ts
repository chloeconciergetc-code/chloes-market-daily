import metaJson from '../data/meta.json'
import kospiJson from '../data/index-kospi.json'
import kosdaqJson from '../data/index-kosdaq.json'
import summaryJson from '../data/market-summary.json'
import breadthJson from '../data/breadth.json'
import themesJson from '../data/themes.json'
import newHighJson from '../data/scanner-newhigh.json'

const dataMap: Record<string, unknown> = {
  'meta.json': metaJson,
  'index-kospi.json': kospiJson,
  'index-kosdaq.json': kosdaqJson,
  'market-summary.json': summaryJson,
  'breadth.json': breadthJson,
  'themes.json': themesJson,
  'scanner-newhigh.json': newHighJson,
}

export function useData<T>(file: string): T | null {
  return (dataMap[file] as T) ?? null
}
