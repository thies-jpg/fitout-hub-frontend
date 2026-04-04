import { apiGet, apiPost, apiPut } from './client'

export function getVariantTestfit(variantId) {
  return apiGet(`/variants/${variantId}/testfit`)
}

export function saveVariantLayout(variantId, layout) {
  return apiPut(`/variants/${variantId}/layout`, { layout })
}

export function recalculateVariant(variantId) {
  return apiPost(`/variants/${variantId}/recalculate`, {})
}

export function cloneVariant(variantId, name) {
  return apiPost(`/variants/${variantId}/clone`, { name })
}