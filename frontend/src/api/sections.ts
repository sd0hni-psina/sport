import { apiClient } from './client'
import type { Section } from '@/types'

export const sectionsApi = {
  list: () =>
    apiClient.get<{ data: Section[] }>('/sections'),

  getById: (id: number) =>
    apiClient.get<{ data: Section }>(`/sections/${id}`),
}