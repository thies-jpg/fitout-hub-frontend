import { apiGet, apiPost } from './client'

export function createCase(payload) {
  return apiPost('/cases', payload)
}

export function saveCaseDemand(caseId, payload) {
  return apiPost(`/cases/${caseId}/demand`, payload)
}

export function runSpaceFit(caseId, payload) {
  return apiPost(`/cases/${caseId}/fit`, payload)
}

export function assignSpaceToCase(caseId, spaceId) {
  return apiPost(`/cases/${caseId}/assign-space`, { space_id: spaceId })
}

export function getCaseMatch(caseId) {
  return apiGet(`/cases/${caseId}/match`)
}

export function finalizeCase(caseId, payload) {
  return apiPost(`/cases/${caseId}/finalize`, payload)
}

export function generateVariants(caseId, strategies) {
  return apiPost('/variants/generate', {
    case_id: caseId,
    strategies,
  })
}