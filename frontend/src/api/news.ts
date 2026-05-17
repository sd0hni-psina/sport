import { apiClient } from './client'
import type { Post } from '@/types'

export const newsApi = {
  list: () => apiClient.get<{ data: Post[] }>('/news'),
  getById: (id: number) => apiClient.get<{ data: Post }>(`/news/${id}`),
}