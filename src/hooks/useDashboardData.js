import { useEffect, useState } from 'react'
import { getDashboardData } from '../api/dashboard'

export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const result = await getDashboardData()
        if (!active) return
        setData(result)
      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to load dashboard')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return { data, loading, error }
}