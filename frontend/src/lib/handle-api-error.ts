import type { AxiosError } from 'axios'

export function getApiError(err: unknown): string {
  const axiosErr = err as AxiosError<{ error: string }>
  return axiosErr?.response?.data?.error ?? 'Неизвестная ошибка'
}