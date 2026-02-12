import { useEffect, useState } from 'react'

const BASE = import.meta.env.BASE_URL

export function useData<T>(file: string): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(`${BASE}data/${file}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [file])
  return { data, loading }
}
