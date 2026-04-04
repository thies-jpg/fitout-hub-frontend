import { apiGet } from './client'

// --- Mock fallback (wird genutzt, wenn API noch nicht existiert)
function getMockDashboard() {
  return {
    portfolio_summary: {
      asset_count: 2,
      floor_count: 3,
      lease_area_count: 4,
    },
    active_cases: [
      {
        id: 'case_204',
        title: 'Tenant X',
        asset_name: 'ABC Tower',
        floor_name: 'Floor 05',
        lease_area_name: 'LA-05A',
        status: 'in_review',
      },
    ],
    alerts: [
      {
        type: 'conflict',
        label: '1 case with unresolved planning conflict',
      },
      {
        type: 'review',
        label: '2 cases waiting for baseline decision',
      },
    ],
    recent_updates: [
      {
        type: 'case_update',
        label: 'Variant B updated in Testfit',
        case_id: 'case_204',
      },
    ],
    next_actions: [
      {
        type: 'continue_case',
        label: 'Review Variant B',
        target: '/cases/204/compare',
      },
    ],
  }
}

// --- Hauptfunktion
export async function getDashboardData() {
  try {
    return await apiGet('/dashboard')
  } catch (err) {
    console.warn('Dashboard API not available, using mock data')
    return getMockDashboard()
  }
}