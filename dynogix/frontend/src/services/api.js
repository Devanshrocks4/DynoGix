import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Request interceptor - attach JWT
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('dynogix-auth') || '{}')
  const token = auth?.state?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dynogix-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data || err)
  }
)

// ─── Auth ───────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  me: () => api.get('/auth/me'),
}

// ─── Dashboard ──────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
  getChartData: () => api.get('/dashboard/charts'),
}

// ─── Issues ─────────────────────────────────────────
export const issuesAPI = {
  getAll: (params) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post('/issues', data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  transition: (id, status) => api.post(`/issues/${id}/transition`, { status }),
  delete: (id) => api.delete(`/issues/${id}`),
  getComments: (id) => api.get(`/issues/${id}/comments`),
  addComment: (id, data) => api.post(`/issues/${id}/comments`, data),
}

// ─── Assets ─────────────────────────────────────────
export const assetsAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  transition: (id, status) => api.post(`/assets/${id}/transition`, { status }),
}

// ─── Audit ──────────────────────────────────────────
export const auditAPI = {
  getLogs: (params) => api.get('/audit', { params }),
  getEntityLogs: (entity, id) => api.get(`/audit/${entity}/${id}`),
}

// ─── Users ──────────────────────────────────────────
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
}

// ─── Analytics ──────────────────────────────────────
export const analyticsAPI = {
  getWorkflow: () => api.get('/analytics/workflow'),
  getProductivity: () => api.get('/analytics/productivity'),
  getTrends: () => api.get('/analytics/trends'),
}

// ─── AI ─────────────────────────────────────────────
export const aiAPI = {
  chat: (messages) => api.post('/ai/chat', { messages }),
  getInsights: () => api.get('/ai/insights'),
}

// ─── Roles ──────────────────────────────────────────
export const rolesAPI = {
  getAll: () => api.get('/roles'),
  updatePermissions: (id, permissions) => api.put(`/roles/${id}/permissions`, { permissions }),
}

export default api
