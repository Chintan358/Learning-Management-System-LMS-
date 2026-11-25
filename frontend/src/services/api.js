import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized and not already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('lms_token')
        localStorage.removeItem('lms_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
