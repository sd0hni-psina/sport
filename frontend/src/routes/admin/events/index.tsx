import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Plus, Pencil, Trash2, Eye, ChevronDown, Search } from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Event } from '@/types'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/events/')({
  component: AdminEventsPage,
})

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  draft:     { label: 'Черновик',      bg: '#F1F5F9', color: '#64748B' },
  published: { label: 'Опубликовано',  bg: '#ECFDF5', color: '#059669' },
  cancelled: { label: 'Отменено',      bg: '#FEF2F2', color: '#DC2626' },
  completed: { label: 'Завершено',     bg: '#EFF6FF', color: '#2563EB' },
}

const STATUS_TRANSITIONS: Record<string, { status: string; label: string; color: string }[]> = {
  draft: [
    { status: 'published', label: 'Опубликовать', color: '#059669' },
    { status: 'cancelled', label: 'Отменить',     color: '#DC2626' },
  ],
  published: [
    { status: 'completed', label: 'Завершить',    color: '#2563EB' },
    { status: 'cancelled', label: 'Отменить',     color: '#DC2626' },
    { status: 'draft',     label: 'В черновик',   color: '#64748B' },
  ],
  cancelled: [
    { status: 'draft',     label: 'В черновик',   color: '#64748B' },
  ],
  completed: [],
}

function StatusDropdown({ event, onStatusChange, loading }: {
  event: Event
  onStatusChange: (id: number, status: string) => void
  loading: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const transitions = STATUS_TRANSITIONS[event.status] ?? []
  const currentStyle = STATUS_STYLES[event.status] ?? STATUS_STYLES.draft

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (transitions.length === 0) {
    return (
      <span
        className="text-xs font-medium px-2.5 py-1 rounded-full"
        style={{ background: currentStyle.bg, color: currentStyle.color }}
      >
        {currentStyle.label}
      </span>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
        style={{ background: currentStyle.bg, color: currentStyle.color }}
      >
        {currentStyle.label}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg py-1 min-w-36"
          style={{ border: '1px solid #E2E8F0' }}
        >
          {transitions.map(({ status, label, color }) => (
            <button
              key={status}
              onClick={() => {
                onStatusChange(event.id, status)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors"
              style={{ color }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminEventsPage() {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => apiClient.get<{ data: Event[] }>('/admin/events').then(r => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/admin/events/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] })
      const label = STATUS_STYLES[vars.status]?.label ?? vars.status
      toast.success(`Статус изменён на "${label}"`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? 'Ошибка при смене статуса')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] })
      setDeletingId(null)
      toast.success('Мероприятие удалено')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? 'Ошибка при удалении')
      setDeletingId(null)
    },
  })

  const allEvents: Event[] = data?.data ?? []
  const counts = allEvents.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const filteredByStatus = statusFilter
  ? allEvents.filter(e => e.status === statusFilter)
  : allEvents

  const events = search
  ? filteredByStatus.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.sport_type.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
    )
  : filteredByStatus

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Мероприятия</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{allEvents.length} всего</p>
        </div>
        <Link
          to="/admin/events/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: '#0D1F3C', color: '#fff' }}
        >
          <Plus size={16} />
          Создать
        </Link>
      </div>

      {/* Фильтр по статусу */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setStatusFilter('')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
          style={!statusFilter
            ? { background: '#0D1F3C', color: '#fff' }
            : { background: '#F1F5F9', color: '#64748B' }
          }
        >
          Все ({allEvents.length})
        </button>
        {Object.entries(STATUS_STYLES).map(([key, val]) => (
          counts[key] ? (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={statusFilter === key
                ? { background: val.color, color: '#fff' }
                : { background: val.bg, color: val.color }
              }
            >
              {val.label} ({counts[key]})
            </button>
          ) : null
        ))}
      </div>

      {/* Поиск */}
<div className="relative mb-3">
  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
  <input
    type="text"
    placeholder="Поиск по названию, виду спорта, месту..."
    value={search}
    onChange={e => setSearch(e.target.value)}
    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
  />
</div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" count={4} />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon="📅"
          title={statusFilter ? 'Нет мероприятий с таким статусом' : 'Мероприятий нет'}
          action={
            !statusFilter ? (
              <Link
                to="/admin/events/new"
                className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
                style={{ background: '#0D1F3C' }}
              >
                Создать первое
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event: Event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl p-5 flex items-center gap-4"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <div
                className="w-1 h-12 rounded-full shrink-0"
                style={{
                  background:
                    event.status === 'published' ? '#059669' :
                    event.status === 'cancelled' ? '#DC2626' :
                    event.status === 'completed' ? '#2563EB' : '#94A3B8'
                }}
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate mb-1" style={{ color: '#0D1F3C' }}>
                  {event.name}
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                  <span>{event.sport_type}</span>
                  <span>·</span>
                  <span>{format(new Date(event.time_start), 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                  <span>·</span>
                  <span className="truncate">{event.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusDropdown
                  event={event}
                  onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
                  loading={statusMutation.isPending}
                />

                <Link
                  to="/events/$id"
                  params={{ id: String(event.id) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#F1F5F9', color: '#64748B' }}
                  title="Просмотр"
                >
                  <Eye size={14} />
                </Link>

                <Link
                  to="/admin/events/$id/edit"
                  params={{ id: String(event.id) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#EFF6FF', color: '#2563EB' }}
                  title="Редактировать"
                >
                  <Pencil size={14} />
                </Link>

                <button
                  onClick={() => setDeletingId(event.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#FEF2F2', color: '#DC2626' }}
                  title="Удалить"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
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