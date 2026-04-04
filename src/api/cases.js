import { apiGet, apiPatch } from './client'

export function getCase(caseId) {
  return apiGet(`/cases/${caseId}`)
}

export function setCaseBaseline(caseId, variantId) {
  return apiPatch(`/cases/${caseId}/baseline`, {
    variant_id: variantId,
  })
}