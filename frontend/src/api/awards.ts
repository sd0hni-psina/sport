import { apiClient } from './client'
import type { Award } from '@/types'

export const awardsApi = {
  myAwards: () =>
    apiClient.get<{ data: Award[] }>('/me/awards'),

  createAward: (applicationId: number, data: { type: string; description: string }) =>
    apiClient.post<{ data: Award }>(`/admin/applications/${applicationId}/award`, data),

  listByApplication: (applicationId: number) =>
    apiClient.get<{ data: Award[] }>(`/admin/applications/${applicationId}/awards`),
}