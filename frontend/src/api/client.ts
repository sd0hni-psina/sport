import axios from 'axios'
import { authStore } from '@/store/auth'

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// прикрепляем access token к каждому запросу
apiClient.interceptors.request.use((config) => {
  const token = authStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      const refreshToken = authStore.getRefreshToken()

      // если нет refresh токена — просто чистим стейт без редиректа
      if (!refreshToken) {
        authStore.clearTokens()
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', {
          refresh_token: refreshToken,
        })
        authStore.setTokens(data.access_token, data.refresh_token ?? refreshToken)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(original)
      } catch {
        authStore.clearTokens()
        // редиректим только если пользователь был авторизован
        if (window.location.pathname.startsWith('/profile')) {
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)