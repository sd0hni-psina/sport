import { apiClient } from './client'
import type { Application } from '@/types'

export const applicationsApi = {
  apply: (eventId: number, data: { child_id?: number; is_volunteer?: boolean; notes?: string }) =>
    apiClient.post<{ data: Application }>(`/events/${eventId}/apply`, data),

  cancel: (id: number) => apiClient.delete(`/applications/${id}`),

  myApplications: () => apiClient.get<{ data: Application[] }>('/me/applications'),
}