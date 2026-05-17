import { apiClient } from './client'
import type { PublicCounters } from '@/types'

export const analyticsApi = {
  getCounters: () => apiClient.get<PublicCounters>('/stats'),
  getFullStats: (params?: { period?: string; from?: string; to?: string }) =>
    apiClient.get('/stats/full', { params }),
}