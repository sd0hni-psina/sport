import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { applicationsApi } from '@/api/applications'
import { authStore } from '@/store/auth'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MapPin, Clock, ArrowLeft, Calendar, X } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Application, Event } from '@/types'

export const Route = createFileRoute('/profile/upcoming')({
  beforeLoad: ({ location }) => {
    if (!authStore.isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
        state: { from: location.href },
      })
    }
  },
  component: UpcomingPage,
})

interface UpcomingItem {
  application: Application
  event: Event
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Ожидает подтверждения', bg: '#FFFBEB', color: '#D97706' },
  confirmed: { label: 'Подтверждена',          bg: '#ECFDF5', color: '#059669' },
}

function UpcomingPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-upcoming'],
    queryFn: () => apiClient.get<{ data: UpcomingItem[] }>('/me/upcoming').then(r => r.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      toast.success('Заявка отменена')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? 'Ошибка при отмене')
    },
  })

  const items: UpcomingItem[] = data?.data ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/profile"
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: '#F1F5F9', color: '#64748B' }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Предстоящие мероприятия</h1>
          <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
            Мероприятия на которые вы записаны
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-36" count={3} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Нет предстоящих мероприятий"
          description="Запишитесь на мероприятие чтобы оно появилось здесь"
          action={
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#0D1F3C' }}
            >
              Найти мероприятие
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(({ application, event }) => {
            const statusStyle = STATUS_STYLES[application.status]
            const daysLeft = formatDistanceToNow(new Date(event.time_start), { locale: ru, addSuffix: true })

            return (
              <div
                key={application.id}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #E2E8F0' }}
              >
                {/* Цветная полоска */}
                <div
                  className="h-1.5"
                  style={{ background: application.status === 'confirmed' ? '#059669' : '#F5A623' }}
                />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ background: '#0D1F3C', color: '#F5A623' }}
                        >
                          {event.sport_type}
                        </span>
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-lg"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                      <Link
                        to="/events/$id"
                        params={{ id: String(event.id) }}
                        className="font-bold text-base leading-snug hover:text-blue-600 transition-colors"
                        style={{ color: '#0D1F3C' }}
                      >
                        {event.name}
                      </Link>
                    </div>

                    {/* Таймер */}
                    <div
                      className="shrink-0 text-right px-3 py-2 rounded-xl"
                      style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                    >
                      <p className="text-xs font-bold" style={{ color: '#0D1F3C' }}>
                        {format(new Date(event.time_start), 'd MMM', { locale: ru })}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                        {daysLeft}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                      <Clock size={13} color="#94A3B8" />
                      <span>
                        {format(new Date(event.time_start), 'd MMMM yyyy, HH:mm', { locale: ru })}
                        {' — '}
                        {format(new Date(event.time_end), 'HH:mm', { locale: ru })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                      <MapPin size={13} color="#94A3B8" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                    <Link
                      to="/events/$id"
                      params={{ id: String(event.id) }}
                      className="text-xs font-semibold"
                      style={{ color: '#2563EB' }}
                    >
                      Подробнее →
                    </Link>
                    <button
                      onClick={() => cancelMutation.mutate(application.id)}
                      disabled={cancelMutation.isPending}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      style={{ background: '#FEF2F2', color: '#DC2626' }}
                    >
                      <X size={12} />
                      Отменить заявку
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}