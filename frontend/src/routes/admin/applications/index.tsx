import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { eventsApi } from '@/api/events'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/shared/Skeleton'
import type { Application, Event, User } from '@/types'
import { awardsApi } from '@/api/awards'
import { exportToCSV } from '@/lib/export-csv'
import { Download, X } from 'lucide-react' 

export const Route = createFileRoute('/admin/applications/')({
  component: AdminApplicationsPage,
})

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  pending:            { label: 'Ожидает',         bg: '#FFFBEB', color: '#D97706' },
  confirmed:          { label: 'Подтверждена',    bg: '#ECFDF5', color: '#059669' },
  cancelled_by_user:  { label: 'Отменена юзером', bg: '#F1F5F9', color: '#64748B' },
  cancelled_by_admin: { label: 'Отменена админом',bg: '#FEF2F2', color: '#DC2626' },
  no_show:            { label: 'Не явился',       bg: '#FEF2F2', color: '#DC2626' },
  attended:           { label: 'Посетил',         bg: '#EFF6FF', color: '#2563EB' },
}

const NEXT_STATUSES: Record<string, { status: string; label: string; color: string }[]> = {
  pending: [
    { status: 'confirmed',          label: 'Подтвердить', color: '#059669' },
    { status: 'cancelled_by_admin', label: 'Отменить',    color: '#DC2626' },
  ],
  confirmed: [
    { status: 'attended',           label: 'Явился',    color: '#2563EB' },
    { status: 'no_show',            label: 'Не явился', color: '#DC2626' },
    { status: 'cancelled_by_admin', label: 'Отменить',  color: '#64748B' },
  ],
}

function AdminApplicationsPage() {
  const queryClient = useQueryClient()
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('')
  const [statusFilter, setStatusFilter] = useState('')
  const [awardingId, setAwardingId] = useState<number | null>(null)
  const [awardForm, setAwardForm] = useState({ type: 'medal', description: '' })

  const { data: eventsData } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => apiClient.get<{ data: Event[] }>('/admin/events').then(r => r.data),
  })

  const { data, isLoading, isError, refetch } = useQuery({
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

  const applications: Application[] = data?.data ?? []

  // подгружаем уникальных пользователей
  const userIds = [...new Set(applications.map(a => a.user_id))]
  const { data: usersMap } = useQuery({
    queryKey: ['admin-users-map', userIds],
    queryFn: async () => {
      const users = await Promise.all(
        userIds.map(id =>
          apiClient.get<{ data: User }>(`/admin/users/${id}`).then(r => r.data.data)
        )
      )
      return Object.fromEntries(users.map(u => [u.id, u]))
    },
    enabled: userIds.length > 0,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/admin/applications/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
      toast.success('Статус обновлён')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? 'Ошибка при обновлении')
    },
  })

  const awardMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { type: string; description: string } }) =>
      awardsApi.createAward(id, data),
    onSuccess: () => {
      setAwardingId(null)
      setAwardForm({ type: 'medal', description: '' })
      toast.success('Награда выдана!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? 'Ошибка при выдаче награды')
    },
  })

  function handleExport() {
    if (applications.length === 0) return

    const headers = ['№', 'ФИО', 'Телефон', 'Статус', 'Волонтёр', 'Дата заявки', 'Комментарий']
    const rows = applications.map((app: Application, i: number) => {
      const user = usersMap?.[app.user_id]
      const userName = user ? `${user.last_name} ${user.first_name} ${user.middle_name ?? ''}`.trim() : `ID ${app.user_id}`
      const phone = user?.phone_number ?? '—'
      const status = STATUS_STYLES[app.status]?.label ?? app.status
      const isVolunteer = app.is_volunteer ? 'Да' : 'Нет'
      const date = format(new Date(app.created_at), 'd MMM yyyy HH:mm', { locale: ru })
      const notes = app.notes ?? '—'

      return [String(i + 1), userName, phone, status, isVolunteer, date, notes]
    })

    const eventName = eventDetail?.name ?? 'мероприятие'
    exportToCSV(`участники_${eventName}.csv`, headers, rows)
  }

  const events: Event[] = eventsData?.data ?? []

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
          onChange={e => {
            setSelectedEventId(e.target.value ? Number(e.target.value) : '')
            setStatusFilter('')
          }}
          className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
        >
          <option value="">— Выберите мероприятие —</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: '#FEF2F2', color: '#DC2626' }}
          >
            <X size={14} />
            Сбросить фильтр
          </button>
        )}
      </div>

      {/* Инфо о мероприятии и Счётчики по статусам */}
      {eventDetail && (
        <div className="mb-5">
          {/* Шапка мероприятия */}
          <div
            className="flex items-center gap-4 p-4 rounded-t-xl"
            style={{ background: '#0D1F3C' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{eventDetail.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>
                {format(new Date(eventDetail.time_start), 'd MMMM yyyy, HH:mm', { locale: ru })} · {eventDetail.location}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-white font-bold text-lg">{applications.length}</p>
                <p className="text-xs" style={{ color: '#7A8FA8' }}>заявок</p>
              </div>
              {applications.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ background: '#F5A623', color: '#0D1F3C' }}
                  title="Экспорт в CSV"
                >
                  <Download size={14} />
                  CSV
                </button>
              )}
            </div>
          </div>

          {/* Счётчики по статусам */}
          <div
            className="grid grid-cols-3 sm:grid-cols-6 rounded-b-xl overflow-hidden"
            style={{ border: '1px solid #E2E8F0', borderTop: 'none' }}
          >
            {Object.entries(STATUS_STYLES).map(([key, val]) => {
              const count = applications.filter((a: Application) => a.status === key).length
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                  className="flex flex-col items-center py-3 px-2 transition-colors"
                  style={{
                    background: statusFilter === key ? val.bg : '#fff',
                    borderRight: '1px solid #E2E8F0',
                  }}
                >
                  <span className="text-lg font-bold" style={{ color: statusFilter === key ? val.color : '#0D1F3C' }}>
                    {count}
                  </span>
                  <span className="text-xs mt-0.5 text-center leading-tight" style={{ color: '#94A3B8', fontSize: '10px' }}>
                    {val.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Список */}
      {!selectedEventId ? (
        <EmptyState
          icon="📋"
          title="Выберите мероприятие"
          description="Выберите мероприятие выше чтобы увидеть заявки"
        />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16" count={4} />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState icon="📭" title="Заявок нет" description="На это мероприятие ещё никто не записался" />
      ) : (
        <div className="flex flex-col gap-2">
          {applications.map((app: Application) => {
            const statusStyle = STATUS_STYLES[app.status] ?? STATUS_STYLES.pending
            const nextStatuses = NEXT_STATUSES[app.status] ?? []
            const user = usersMap?.[app.user_id]
            const userName = user
              ? `${user.last_name} ${user.first_name}`
              : `Участник #${app.user_id}`
            const userInitials = user
              ? `${user.first_name[0]}${user.last_name[0]}`
              : `#${app.user_id}`

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl p-4 flex items-center gap-4"
                style={{ border: '1px solid #E2E8F0' }}
              >
                {/* Аватар */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: '#0D1F3C', color: '#F5A623' }}
                >
                  {userInitials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color: '#0D1F3C' }}>
                      {userName}
                    </p>
                    {user && (
                      <span className="text-xs" style={{ color: '#94A3B8' }}>
                        {user.phone_number}
                      </span>
                    )}
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

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
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
                  {app.status === 'attended' && (
                    <button
                      onClick={() => setAwardingId(app.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: '#FFF8E7', color: '#D97706' }}
                    >
                      🏅 Выдать награду
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Модалка награды */}
      {awardingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-5" style={{ color: '#0D1F3C' }}>Выдать награду</h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>Тип награды</label>
                <select
                  value={awardForm.type}
                  onChange={e => setAwardForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
                >
                  <option value="medal">🥇 Медаль</option>
                  <option value="diploma">📜 Диплом</option>
                  <option value="certificate">🏆 Сертификат</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>Описание</label>
                <input
                  value={awardForm.description}
                  onChange={e => setAwardForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="1 место в забеге 5 км"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setAwardingId(null); setAwardForm({ type: 'medal', description: '' }) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}
              >
                Отмена
              </button>
              <button
                onClick={() => awardMutation.mutate({ id: awardingId, data: awardForm })}
                disabled={awardMutation.isPending || !awardForm.description}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#0D1F3C' }}
              >
                {awardMutation.isPending ? 'Выдача...' : 'Выдать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}