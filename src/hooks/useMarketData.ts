import { useState, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL + 'data/'

export function useData<T>(file: string): T | null {
  const [data, setData] = useState<T | null>(null)
  useEffect(() => {
    fetch(BASE + file).then(r => r.json()).then(setData).catch(() => null)
  }, [file])
  return data
}
