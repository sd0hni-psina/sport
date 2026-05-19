import { apiClient } from './client'
import type { Event } from '@/types'

export const eventsApi = {
  list: (params?: { sport?: string; date?: string; age?: number; page?: number }) =>
    apiClient.get<{ data: Event[] }>('/events', { params }),

  getById: (id: number) =>
    apiClient.get<{ data: Event }>(`/events/${id}`),
  getByIds: (ids: number[]) =>
  Promise.all(ids.map(id => apiClient.get<{ data: Event }>(`/events/${id}`).then(r => r.data.data))),
}