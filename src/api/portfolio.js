import { apiGet, apiPost } from './client'

const MOCK_PORTFOLIO_TREE = [
  {
    id: 'asset_abc_tower',
    name: 'ABC Tower',
    location: 'Berlin',
    status: 'active',
    floors: [
      {
        id: 'floor_05',
        asset_id: 'asset_abc_tower',
        name: 'Floor 05',
        level_index: 5,
        lease_areas: [
          {
            id: 'la_05a',
            asset_id: 'asset_abc_tower',
            floor_id: 'floor_05',
            name: 'LA-05A',
            area_sqm: 420,
            status: 'vacant',
            cases: [
              {
                id: 'case_204',
                title: 'Tenant X',
                status: 'in_review',
              },
            ],
          },
          {
            id: 'la_05b',
            asset_id: 'asset_abc_tower',
            floor_id: 'floor_05',
            name: 'LA-05B',
            area_sqm: 360,
            status: 'vacant',
            cases: [],
          },
        ],
      },
      {
        id: 'floor_06',
        asset_id: 'asset_abc_tower',
        name: 'Floor 06',
        level_index: 6,
        lease_areas: [
          {
            id: 'la_06a',
            asset_id: 'asset_abc_tower',
            floor_id: 'floor_06',
            name: 'LA-06A',
            area_sqm: 510,
            status: 'occupied',
            cases: [],
          },
        ],
      },
    ],
  },
]

export async function getPortfolioTree() {
  try {
    return await apiGet('/portfolio/tree')
  } catch (error) {
    console.warn('Portfolio API unavailable, using mock data.', error)
    return { items: MOCK_PORTFOLIO_TREE }
  }
}

export async function createAsset(payload) {
  return apiPost('/portfolio/assets', payload)
}

export async function createFloor(payload) {
  return apiPost('/portfolio/floors', payload)
}

export async function createLeaseArea(payload) {
  return apiPost('/portfolio/lease-areas', payload)
}

export { MOCK_PORTFOLIO_TREE }