import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { AuthResponse } from '@/types/auth'

// ─── Axios Instance ────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Flag to prevent refresh loops ────────────────────────
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

// ─── Request Interceptor — attach access token ─────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response Interceptor — auto-refresh on 401 ───────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Skip the refresh flow for auth endpoints - let the error bubble up to the component
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
                           originalRequest?.url?.includes('/auth/register')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = sessionStorage.getItem('refreshToken')
      if (!refreshToken) {
        clearAuthStorage()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken })
        sessionStorage.setItem('accessToken', data.accessToken)
        sessionStorage.setItem('refreshToken', data.refreshToken)
        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthStorage()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

function clearAuthStorage() {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
}

export default api
