type Listener = () => void

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

const listeners = new Set<Listener>()

function decodeJWT(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export const authStore = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    listeners.forEach(l => l())
  },

  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    listeners.forEach(l => l())
  },

  isAuthenticated: () => !!localStorage.getItem(ACCESS_TOKEN_KEY),

  getRole: (): string | null => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (!token) return null
    return decodeJWT(token)?.role ?? null
  },

  isAdmin: (): boolean => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (!token) return false
    return decodeJWT(token)?.role === 'admin'
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}