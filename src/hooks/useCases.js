import { useEffect, useState } from 'react'
import { getCases } from '../api/cases'

export function useCases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getCases()
        setCases(data.cases || [])
      } catch (err) {
        setError(err.message || 'Failed to load cases')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { cases, loading, error }
}