import { apiClient } from './client'

export interface GalleryItem {
  id: number
  event_id: number | null
  url: string
  type: 'photo' | 'video'
  caption: string | null
  created_at: string
}

export interface GalleryFilter {
  event_id?: number
  year?: number
}

export const galleryApi = {
  list: (params?: GalleryFilter) =>
    apiClient.get<{ data: GalleryItem[] }>('/gallery', { params }),
}