import { authStore } from '@/store/auth'
import { authApi } from '@/api/auth'
import type { QueryClient } from '@tanstack/react-query'

export async function logout(queryClient: QueryClient, navigate: (opts: any) => void) {
  try {
    await authApi.logout()
  } catch {
    // игнорируем ошибку — всё равно разлогиниваем
  }
  authStore.clearTokens()
  queryClient.clear()
  navigate({ to: '/' })
}