import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Plus, Pencil, Trash2, Eye, CheckCircle } from 'lucide-react'
import type { Event } from '@/types'
import { useState } from 'react'

export const Route = createFileRoute('/admin/events/')({
  component: AdminEventsPage,
})

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  draft:     { label: 'Черновик',   bg: '#F1F5F9', color: '#64748B' },
  published: { label: 'Опубликовано', bg: '#ECFDF5', color: '#059669' },
  cancelled: { label: 'Отменено',   bg: '#FEF2F2', color: '#DC2626' },
  completed: { label: 'Завершено',  bg: '#EFF6FF', color: '#2563EB' },
}

function AdminEventsPage() {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => apiClient.get<{ data: Event[] }>('/admin/events').then(r => r.data),
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient.patch(`/admin/events/${id}/status`, { status: 'published' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-events'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      setDeletingId(null)
    },
  })

  const events: Event[] = data?.data ?? []

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Мероприятия</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{events.length} всего</p>
        </div>
        <Link
          to="/admin/events/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: '#0D1F3C', color: '#fff' }}
        >
          <Plus size={16} />
          Создать
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" style={{ border: '1px solid #E2E8F0' }} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl" style={{ border: '1px solid #E2E8F0' }}>
          <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Мероприятий нет</p>
          <Link to="/admin/events/new" className="text-sm font-medium mt-2 inline-block" style={{ color: '#2563EB' }}>
            Создать первое →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event: Event) => {
            const statusStyle = STATUS_STYLES[event.status] ?? STATUS_STYLES.draft
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl p-5 flex items-center gap-4"
                style={{ border: '1px solid #E2E8F0' }}
              >
                {/* Цветная полоска слева */}
                <div className="w-1 h-12 rounded-full shrink-0" style={{ background: event.status === 'published' ? '#059669' : event.status === 'cancelled' ? '#DC2626' : '#0D1F3C' }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate" style={{ color: '#0D1F3C' }}>
                      {event.name}
                    </p>
                    <span
                      className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                    <span>{event.sport_type}</span>
                    <span>·</span>
                    <span>{format(new Date(event.time_start), 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                    <span>·</span>
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Действия */}
                <div className="flex items-center gap-2 shrink-0">
                  {event.status === 'draft' && (
                    <button
                      onClick={() => publishMutation.mutate(event.id)}
                      disabled={publishMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: '#ECFDF5', color: '#059669' }}
                      title="Опубликовать"
                    >
                      <CheckCircle size={13} />
                      Опубликовать
                    </button>
                  )}

                  <Link
                    to="/events/$id"
                    params={{ id: String(event.id) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#F1F5F9', color: '#64748B' }}
                    title="Просмотр"
                  >
                    <Eye size={14} />
                  </Link>

                  <Link
                    to="/admin/events/$id/edit"
                    params={{ id: String(event.id) }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#EFF6FF', color: '#2563EB' }}
                    title="Редактировать"
                  >
                    <Pencil size={14} />
                  </Link>

                  <button
                    onClick={() => setDeletingId(event.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: '#FEF2F2', color: '#DC2626' }}
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Модал подтверждения удаления */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-2" style={{ color: '#0D1F3C' }}>Удалить мероприятие?</h3>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>
              Это действие нельзя отменить. Мероприятия с активными заявками удалить нельзя.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}
              >
                Отмена
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: '#DC2626' }}
              >
                {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}