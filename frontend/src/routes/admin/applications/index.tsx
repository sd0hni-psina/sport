import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { eventsApi } from '@/api/events'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState } from 'react'
import type { Application, Event } from '@/types'

export const Route = createFileRoute('/admin/applications/')({
  component: AdminApplicationsPage,
})

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  pending:            { label: 'Ожидает',        bg: '#FFFBEB', color: '#D97706' },
  confirmed:          { label: 'Подтверждена',   bg: '#ECFDF5', color: '#059669' },
  cancelled_by_user:  { label: 'Отменена юзером', bg: '#F1F5F9', color: '#64748B' },
  cancelled_by_admin: { label: 'Отменена админом', bg: '#FEF2F2', color: '#DC2626' },
  no_show:            { label: 'Не явился',      bg: '#FEF2F2', color: '#DC2626' },
  attended:           { label: 'Посетил',        bg: '#EFF6FF', color: '#2563EB' },
}

const NEXT_STATUSES: Record<string, { status: string; label: string; color: string }[]> = {
  pending: [
    { status: 'confirmed',          label: 'Подтвердить',  color: '#059669' },
    { status: 'cancelled_by_admin', label: 'Отменить',     color: '#DC2626' },
  ],
  confirmed: [
    { status: 'attended',           label: 'Отметить явку',  color: '#2563EB' },
    { status: 'no_show',            label: 'Не явился',      color: '#DC2626' },
    { status: 'cancelled_by_admin', label: 'Отменить',       color: '#64748B' },
  ],
}

function AdminApplicationsPage() {
  const queryClient = useQueryClient()
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: eventsData } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => apiClient.get<{ data: Event[] }>('/admin/events').then(r => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', selectedEventId, statusFilter],
    queryFn: () => {
      if (!selectedEventId) return Promise.resolve({ data: [] })
      const params = new URLSearchParams({ event_id: String(selectedEventId) })
      if (statusFilter) params.set('status', statusFilter)
      return apiClient.get<{ data: Application[] }>(`/admin/applications?${params}`).then(r => r.data)
    },
    enabled: !!selectedEventId,
  })

  const { data: eventDetail } = useQuery({
    queryKey: ['event', selectedEventId],
    queryFn: () => eventsApi.getById(Number(selectedEventId)).then(r => r.data.data),
    enabled: !!selectedEventId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/admin/applications/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-applications'] }),
  })

  const events: Event[] = eventsData?.data ?? []
  const applications: Application[] = data?.data ?? []

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Заявки</h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Управление заявками участников</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-2xl p-5 mb-5 flex flex-col sm:flex-row gap-3" style={{ border: '1px solid #E2E8F0' }}>
        <select
          value={selectedEventId}
          onChange={e => setSelectedEventId(e.target.value ? Number(e.target.value) : '')}
          className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
        >
          <option value="">— Выберите мероприятие —</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          style={{ border: '1px solid #E2E8F0', color: '#0D1F3C', minWidth: '160px' }}
        >
          <option value="">Все статусы</option>
          {Object.entries(STATUS_STYLES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Инфо о мероприятии */}
      {eventDetail && (
        <div
          className="flex items-center gap-4 p-4 rounded-xl mb-5"
          style={{ background: '#0D1F3C' }}
        >
          <div>
            <p className="text-white font-semibold text-sm">{eventDetail.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>
              {format(new Date(eventDetail.time_start), 'd MMMM yyyy, HH:mm', { locale: ru })} · {eventDetail.location}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white font-bold text-lg">{applications.length}</p>
            <p className="text-xs" style={{ color: '#7A8FA8' }}>заявок</p>
          </div>
        </div>
      )}

      {/* Список */}
      {!selectedEventId ? (
        <div className="text-center py-20 bg-white rounded-2xl" style={{ border: '1px solid #E2E8F0' }}>
          <p className="text-sm" style={{ color: '#94A3B8' }}>Выберите мероприятие чтобы увидеть заявки</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" style={{ border: '1px solid #E2E8F0' }} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl" style={{ border: '1px solid #E2E8F0' }}>
          <p className="text-sm" style={{ color: '#94A3B8' }}>Заявок нет</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {applications.map((app: Application) => {
            const statusStyle = STATUS_STYLES[app.status] ?? STATUS_STYLES.pending
            const nextStatuses = NEXT_STATUSES[app.status] ?? []

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl p-4 flex items-center gap-4"
                style={{ border: '1px solid #E2E8F0' }}
              >
                {/* Аватар */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: '#0D1F3C', color: '#F5A623' }}
                >
                  #{app.id}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold" style={{ color: '#0D1F3C' }}>
                      Участник #{app.user_id}
                    </p>
                    {app.child_id && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>
                        Ребёнок
                      </span>
                    )}
                    {app.is_volunteer && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FFF8E7', color: '#D97706' }}>
                        Волонтёр
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>
                    {format(new Date(app.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                    {app.notes && ` · "${app.notes}"`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {statusStyle.label}
                  </span>

                  {nextStatuses.map(({ status, label, color }) => (
                    <button
                      key={status}
                      onClick={() => statusMutation.mutate({ id: app.id, status })}
                      disabled={statusMutation.isPending}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      style={{ background: color + '15', color }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}