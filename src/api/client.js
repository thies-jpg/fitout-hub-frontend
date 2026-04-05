const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://178.104.116.71:3001/api'

async function handleResponse(response) {
  if (!response.ok) {
    let message = 'API request failed'
    try {
      const data = await response.json()
      message = data.error || message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  return response.json()
}

export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return handleResponse(response)
}

export async function apiPatch(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return handleResponse(response)
}

export async function apiPut(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return handleResponse(response)
}

export async function apiPost(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return handleResponse(response)
}