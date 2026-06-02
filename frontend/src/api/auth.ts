import { apiClient } from './client'
import type { TokenResponse } from '@/types'

export const authApi = {
  register: (data: {
    first_name: string
    last_name: string
    middle_name?: string
    phone_number: string
    city: string
    birth_date: string
  }) => apiClient.post('/auth/register', data),

  registerEmail: (data: {
  first_name: string
  last_name: string
  middle_name?: string
  email: string
  city: string
  birth_date: string
}) => apiClient.post('/auth/register-email', data),

loginEmail: (data: { email: string }) =>
  apiClient.post('/auth/login-email', data),

verifyEmail: (data: { email: string; code: string }) =>
  apiClient.post<TokenResponse>('/auth/verify-email', data),

  verify: (data: { phone_number: string; code: string }) =>
    apiClient.post<TokenResponse>('/auth/verify', data),

  login: (data: { phone_number: string }) =>
    apiClient.post('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),
}