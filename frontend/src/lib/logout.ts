import { authStore } from '@/store/auth'
import { authApi } from '@/api/auth'
import type { QueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

export async function logout(queryClient: QueryClient, navigate: (opts: any) => void) {
  const refreshToken = authStore.getRefreshToken()
  try {
    await authApi.logout()
    // передаём refresh token для инвалидации
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken })
    }
  } catch {
    // игнорируем
  }
  authStore.clearTokens()
  queryClient.clear()
  navigate({ to: '/' })
}