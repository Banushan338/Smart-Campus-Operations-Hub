const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()
  if (!response.ok) {
    if (response.status === 401 && path.startsWith('/api/v1/') && !path.startsWith('/api/v1/auth')) {
      throw new Error('Your session expired or you are not signed in. Please log in again.')
    }
    const message = payload?.message || payload || `Request failed (${response.status})`
    throw new Error(message)
  }
  return payload
}

function requestForm(path, formData) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  }).then(async (response) => {
    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json') ? await response.json() : await response.text()
    if (!response.ok) {
      throw new Error(payload?.message || payload || `Upload failed (${response.status})`)
    }
    return payload
  })
}

export const api = {
  baseUrl: API_BASE_URL,
  auth: {
    me: () => request('/api/v1/me'),
    loginUrl: () => `${API_BASE_URL}/oauth2/authorization/google`,
    login: (body) => request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request('/logout', { method: 'POST' }),
  },
  resources: {
    list: (params = {}) => {
      const query = new URLSearchParams()
      if (params.type) query.set('type', params.type)
      if (params.status) query.set('status', params.status)
      if (params.minCapacity) query.set('minCapacity', params.minCapacity)
      if (params.location) query.set('location', params.location)
      return request(`/api/v1/resources${query.toString() ? `?${query.toString()}` : ''}`)
    },
    get: (id) => request(`/api/v1/resources/${id}`),
    create: (body) => request('/api/v1/resources', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/v1/resources/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/v1/resources/${id}`, { method: 'DELETE' }),
  },
  bookings: {
    mine: () => request('/api/v1/bookings/mine'),
    listAll: (params = {}) => {
      const query = new URLSearchParams()
      if (params.status) query.set('status', params.status)
      if (params.resourceId) query.set('resourceId', params.resourceId)
      return request(`/api/v1/bookings${query.toString() ? `?${query.toString()}` : ''}`)
    },
    create: (body) => request('/api/v1/bookings', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/v1/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    review: (id, body) => request(`/api/v1/bookings/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) }),
    checkIn: (id) => request(`/api/v1/bookings/${id}/check-in`, { method: 'POST' }),
    cancel: (id) => request(`/api/v1/bookings/${id}`, { method: 'DELETE' }),
  },
  tickets: {
    all: (params = {}) => {
      const query = new URLSearchParams()
      if (params.status) query.set('status', params.status)
      if (params.priority) query.set('priority', params.priority)
      return request(`/api/v1/tickets${query.toString() ? `?${query.toString()}` : ''}`)
    },
    mine: () => request('/api/v1/tickets/mine'),
    assigned: () => request('/api/v1/tickets/assigned'),
    get: (id) => request(`/api/v1/tickets/${id}`),
    create: (body) => request('/api/v1/tickets', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/v1/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  ticketComments: {
    list: (ticketId) => request(`/api/v1/tickets/${ticketId}/comments`),
    add: (ticketId, body) => request(`/api/v1/tickets/${ticketId}/comments`, { method: 'POST', body: JSON.stringify(body) }),
    update: (ticketId, commentId, body) => request(`/api/v1/tickets/${ticketId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    delete: (ticketId, commentId) => request(`/api/v1/tickets/${ticketId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
  },
  ticketAttachments: {
    upload: (ticketId, file) => {
      const formData = new FormData()
      formData.append('file', file)
      return requestForm(`/api/v1/tickets/${ticketId}/attachments`, formData)
    },
    downloadUrl: (ticketId, attachmentId) => `${API_BASE_URL}/api/v1/tickets/${ticketId}/attachments/${attachmentId}/file`,
    delete: (ticketId, attachmentId) => request(`/api/v1/tickets/${ticketId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    }),
  },
  notifications: {
    list: () => request('/api/v1/notifications'),
    unreadCount: () => request('/api/v1/notifications/unread-count'),
    markRead: (id) => request(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/api/v1/notifications/read-all', { method: 'POST' }),
  },
  users: {
    updateRole: (id, role) => request(`/api/v1/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  },
}
