import { apiClient } from './client'
import type { Event } from '@/types'

export interface EventsListParams {
  sport?: string
  date?: string
  age?: number
  page?: number
  page_size?: number
}

export interface EventsListResponse {
  data: Event[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

export const eventsApi = {
  list: (params?: EventsListParams) =>
    apiClient.get<EventsListResponse>('/events', { params }),

  getById: (id: number) =>
    apiClient.get<{ data: Event }>(`/events/${id}`),

  getByIds: (ids: number[]) =>
    Promise.all(ids.map(id =>
      apiClient.get<{ data: Event }>(`/events/${id}`).then(r => r.data.data)
    )),
}