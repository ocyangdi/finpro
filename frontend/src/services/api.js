import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: (userId) => api.get(`/auth/profile?userId=${userId}`),
  verifyToken: (token) => api.post('/auth/verify', { token }),
}

// Documents API
export const documentsAPI = {
  getAll: (params = {}) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  getContent: (id) => api.get(`/documents/${id}/content`),
  delete: (id) => api.delete(`/documents/${id}`),
  search: (query, params = {}) => api.get('/documents/search/text', { 
    params: { q: query, ...params } 
  }),
  getStats: (userId) => api.get('/documents/stats/summary', { 
    params: userId ? { userId } : {} 
  }),
  reprocess: (id) => api.post(`/documents/${id}/reprocess`),
}

// Upload API
export const uploadAPI = {
  upload: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getStatus: (documentId) => api.get(`/upload/status/${documentId}`),
}

// QA API
export const qaAPI = {
  ask: (data) => api.post('/qa/ask', data),
  batchAsk: (data) => api.post('/qa/batch-ask', data),
  search: (data) => api.post('/qa/search', data),
  getCapabilities: () => api.get('/qa/capabilities'),
  getHistory: (params = {}) => api.get('/qa/history', { params }),
}

// Copilot API
export const copilotAPI = {
  enhanceQA: (data) => api.post('/copilot/enhance-qa', data),
  summarize: (data) => api.post('/copilot/summarize', data),
  generateCode: (data) => api.post('/copilot/generate-code', data),
  getStatus: () => api.get('/copilot/status'),
  getCapabilities: () => api.get('/copilot/capabilities'),
}

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
}

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.error || 'An error occurred',
      details: error.response.data,
      status: error.response.status,
    }
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Network error. Please check your connection.',
      details: null,
      status: null,
    }
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      details: null,
      status: null,
    }
  }
}

export default api