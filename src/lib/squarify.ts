interface TreemapNode {
  name: string
  value: number
  change: number
  ticker?: string
  sector?: string
}

export interface LayoutRect {
  x: number
  y: number
  w: number
  h: number
  name: string
  value: number
  change: number
  ticker: string
  sector: string
}

function worst(row: number[], w: number): number {
  const s = row.reduce((a, b) => a + b, 0)
  const maxR = Math.max(...row)
  const minR = Math.min(...row)
  return Math.max((w * w * maxR) / (s * s), (s * s) / (w * w * minR))
}

export function squarify(data: TreemapNode[], width: number, height: number): LayoutRect[] {
  if (!data.length || width <= 0 || height <= 0) return []

  const sorted = [...data].sort((a, b) => b.value - a.value)
  const totalValue = sorted.reduce((s, d) => s + d.value, 0)
  if (totalValue <= 0) return []

  const areas = sorted.map(d => (d.value / totalValue) * width * height)
  const results: LayoutRect[] = []

  let x = 0, y = 0, remainW = width, remainH = height

  function layoutRow(row: number[], indices: number[]) {
    const sum = row.reduce((a, b) => a + b, 0)
    const isHorizontal = remainW <= remainH

    if (isHorizontal) {
      const rowH = sum / remainW
      let cx = x
      for (let i = 0; i < row.length; i++) {
        const cellW = row[i] / rowH
        const node = sorted[indices[i]]
        results.push({
          x: cx, y, w: cellW, h: rowH,
          name: node.name, value: node.value, change: node.change,
          ticker: node.ticker ?? '', sector: node.sector ?? '',
        })
        cx += cellW
      }
      y += rowH
      remainH -= rowH
    } else {
      const rowW = sum / remainH
      let cy = y
      for (let i = 0; i < row.length; i++) {
        const cellH = row[i] / rowW
        const node = sorted[indices[i]]
        results.push({
          x, y: cy, w: rowW, h: cellH,
          name: node.name, value: node.value, change: node.change,
          ticker: node.ticker ?? '', sector: node.sector ?? '',
        })
        cy += cellH
      }
      x += rowW
      remainW -= rowW
    }
  }

  let currentRow: number[] = []
  let currentIndices: number[] = []

  for (let i = 0; i < areas.length; i++) {
    const shortSide = Math.min(remainW, remainH)
    if (shortSide <= 0) break

    const newRow = [...currentRow, areas[i]]
    const newIndices = [...currentIndices, i]

    if (currentRow.length === 0 || worst(newRow, shortSide) <= worst(currentRow, shortSide)) {
      currentRow = newRow
      currentIndices = newIndices
    } else {
      layoutRow(currentRow, currentIndices)
      currentRow = [areas[i]]
      currentIndices = [i]
    }
  }

  if (currentRow.length > 0) {
    layoutRow(currentRow, currentIndices)
  }

  return results
}
