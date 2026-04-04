import { useCallback, useEffect, useState } from 'react'
import { getCase, setCaseBaseline } from '../api/cases'

export function useCaseData(caseId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const result = await getCase(caseId)
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load case')
    } finally {
      setLoading(false)
    }
  }, [caseId])

  const updateBaseline = useCallback(async (variantId) => {
    await setCaseBaseline(caseId, variantId)
    await load()
  }, [caseId, load])

  useEffect(() => {
    load()
  }, [load])

  return {
    data,
    loading,
    error,
    reload: load,
    updateBaseline,
  }
}