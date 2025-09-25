// src/api/http.ts
import axios from 'axios'
import { getToken, logout } from '../store/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
})

// attach JWT if we have one
api.interceptors.request.use((config) => {
  const t = getToken()
  if (t) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${t}`
  }
  return config
})

// helper: is this an auth endpoint?
function isAuthPath(url?: string) {
  if (!url) return false
  // normalize to path segment only
  try {
    const u = new URL(url, api.defaults.baseURL)
    url = u.pathname.toLowerCase()
  } catch {
    url = url.toLowerCase()
  }
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/confirm-email') ||
    url.includes('/auth/verify') // if you ever name it like this
  )
}

// global 401 handler — but SKIP for auth calls to avoid the “flash then refresh”
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    const url = err?.config?.url

    if (status === 401 && !isAuthPath(url)) {
      // only kick the user out if a protected call failed, not when login fails
      logout()
      // use client-side navigation if possible; fallback to hard redirect
      if (typeof window !== 'undefined') {
        try {
          // don't hard-refresh so UI messages aren't lost
          window.history.pushState({}, '', '/login')
          window.dispatchEvent(new Event('popstate'))
        } catch {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(err)
  }
)

export default api
