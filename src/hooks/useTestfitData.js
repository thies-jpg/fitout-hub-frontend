import { useCallback, useEffect, useState } from 'react'
import {
  cloneVariant,
  getVariantTestfit,
  recalculateVariant,
  saveVariantLayout,
} from '../api/variants'

export function useTestfitData(variantId) {
  const [data, setData] = useState(null)
  const [layout, setLayout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const result = await getVariantTestfit(variantId)
      setData(result)
      setLayout(result.layout || { generator_inputs: {} })
      setDirty(false)
    } catch (err) {
      setError(err.message || 'Failed to load testfit')
    } finally {
      setLoading(false)
    }
  }, [variantId])

  useEffect(() => {
    load()
  }, [load])

  const updateLayout = useCallback((updater) => {
    setLayout((prev) => {
      const safePrev = prev || { generator_inputs: {} }
      const next = typeof updater === 'function' ? updater(safePrev) : updater
      return next
    })
    setDirty(true)
  }, [])

  const save = useCallback(async () => {
    if (!layout) return null

    try {
      setSaving(true)

      await saveVariantLayout(variantId, layout)
      const recalculated = await recalculateVariant(variantId)

      setData((prev) => ({
        ...prev,
        layout,
        kpis: recalculated.kpis,
        rules: recalculated.rules,
        variant: {
          ...prev.variant,
          version_no: (prev.variant?.version_no || 0) + 1,
        },
      }))

      setDirty(false)
      return recalculated
    } finally {
      setSaving(false)
    }
  }, [layout, variantId])

  const saveAsVariant = useCallback(async (name) => {
    return cloneVariant(variantId, name)
  }, [variantId])

  return {
    data,
    layout,
    loading,
    saving,
    error,
    dirty,
    reload: load,
    updateLayout,
    save,
    saveAsVariant,
  }
}