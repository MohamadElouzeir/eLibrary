// src/store/auth.ts
import { useSyncExternalStore } from 'react'

let _token = localStorage.getItem('token') || ''

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  return () => window.removeEventListener('storage', cb)
}

export function getToken() { return _token }

function decodeRole(token: string): string | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    // base64url -> base64
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return (
      json.role ||
      json.Role ||
      json['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      null
    )
  } catch {
    return null
  }
}

function setToken(t: string) {
  _token = t
  if (t) localStorage.setItem('token', t)
  else localStorage.removeItem('token')
  // wake subscribers
  window.dispatchEvent(new StorageEvent('storage'))
}

export function useAuth() {
  useSyncExternalStore(subscribe, () => _token, () => _token)
  return {
    token: _token,
    role: _token ? decodeRole(_token) : null,
    login(token: string) { setToken(token) },
    logout() { setToken('') }
  }
}

export function logout() { setToken('') }
