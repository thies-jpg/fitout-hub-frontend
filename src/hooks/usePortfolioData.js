import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPortfolioTree } from '../api/portfolio'

function findAssetById(items, assetId) {
  return items.find((asset) => asset.id === assetId) || null
}

function findFloorById(items, floorId) {
  for (const asset of items) {
    const floor = (asset.floors || []).find((entry) => entry.id === floorId)
    if (floor) {
      return { asset, floor }
    }
  }
  return null
}

function findLeaseAreaById(items, leaseAreaId) {
  for (const asset of items) {
    for (const floor of asset.floors || []) {
      const leaseArea = (floor.lease_areas || []).find((entry) => entry.id === leaseAreaId)
      if (leaseArea) {
        return { asset, floor, leaseArea }
      }
    }
  }
  return null
}

export function usePortfolioData() {
  const [searchParams] = useSearchParams()

  const assetIdFromQuery = searchParams.get('asset_id')
  const floorIdFromQuery = searchParams.get('floor_id')
  const leaseAreaIdFromQuery = searchParams.get('lease_area_id')

  const [data, setData] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await getPortfolioTree()
      const items = result.items || result || []

      setData(items)

      setSelectedNode((prev) => {
        if (prev) return prev

        if (leaseAreaIdFromQuery) {
          return {
            type: 'lease_area',
            id: leaseAreaIdFromQuery,
          }
        }

        if (floorIdFromQuery) {
          return {
            type: 'floor',
            id: floorIdFromQuery,
          }
        }

        if (assetIdFromQuery) {
          return {
            type: 'asset',
            id: assetIdFromQuery,
          }
        }

        if (items.length > 0) {
          return {
            type: 'asset',
            id: items[0].id,
          }
        }

        return null
      })
    } catch (err) {
      setError(err.message || 'Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }, [assetIdFromQuery, floorIdFromQuery, leaseAreaIdFromQuery])

  useEffect(() => {
    load()
  }, [load])

  const selectedContext = useMemo(() => {
    if (!selectedNode) return null

    if (selectedNode.type === 'asset') {
      const asset = findAssetById(data, selectedNode.id)
      if (!asset) return null

      return {
        type: 'asset',
        asset,
        floors: asset.floors || [],
        leaseAreas: (asset.floors || []).flatMap((floor) => floor.lease_areas || []),
        cases: (asset.floors || []).flatMap((floor) =>
          (floor.lease_areas || []).flatMap((leaseArea) => leaseArea.cases || [])
        ),
      }
    }

    if (selectedNode.type === 'floor') {
      const match = findFloorById(data, selectedNode.id)
      if (!match) return null

      return {
        type: 'floor',
        asset: match.asset,
        floor: match.floor,
        leaseAreas: match.floor.lease_areas || [],
        cases: (match.floor.lease_areas || []).flatMap((leaseArea) => leaseArea.cases || []),
      }
    }

    if (selectedNode.type === 'lease_area') {
      const match = findLeaseAreaById(data, selectedNode.id)
      if (!match) return null

      return {
        type: 'lease_area',
        asset: match.asset,
        floor: match.floor,
        leaseArea: match.leaseArea,
        cases: match.leaseArea.cases || [],
      }
    }

    return null
  }, [data, selectedNode])

  return {
    data,
    loading,
    error,
    selectedNode,
    setSelectedNode,
    selectedContext,
    reload: load,
  }
}