import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/api/events'
import { applicationsApi } from '@/api/applications'
import { authStore } from '@/store/auth'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MapPin, Clock, Users, Trophy, User, ArrowLeft, CheckCircle, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import type { Application } from '@/types'
import { useNavigate } from '@tanstack/react-router'
import { EventMap } from '@/components/shared/EventMap'


export const Route = createFileRoute('/events/$id')({
  component: EventPage,
})

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending:            { label: 'Ожидает подтверждения', bg: '#FFFBEB', color: '#D97706' },
  confirmed:          { label: 'Подтверждена',          bg: '#ECFDF5', color: '#059669' },
  cancelled_by_user:  { label: 'Отменена вами',         bg: '#F1F5F9', color: '#64748B' },
  cancelled_by_admin: { label: 'Отменена',              bg: '#FEF2F2', color: '#DC2626' },
  no_show:            { label: 'Не явился',             bg: '#FEF2F2', color: '#DC2626' },
  attended:           { label: 'Посетил ✓',             bg: '#EFF6FF', color: '#2563EB' },
}

function EventPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const isAuth = authStore.isAuthenticated()
  const [error, setError] = useState('')
  const navigate = useNavigate()


  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(Number(id)).then(r => r.data.data),
  })

  const { data: myApps } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationsApi.myApplications().then(r => r.data),
    enabled: isAuth,
  })

  const existingApplication = myApps?.data?.find(
    (a: Application) =>
      a.event_id === Number(id) &&
      a.status !== 'cancelled_by_user' &&
      a.status !== 'cancelled_by_admin'
  )

  const cancelledApplication = myApps?.data?.find(
    (a: Application) =>
      a.event_id === Number(id) &&
      (a.status === 'cancelled_by_user' || a.status === 'cancelled_by_admin')
  )

  const applyMutation = useMutation({
    mutationFn: () => applicationsApi.apply(Number(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      toast.success('Заявка подана! Ожидайте подтверждения.')
      setError('')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error ?? 'Ошибка при подаче заявки'
      toast.error(msg)
      setError(msg)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (appId: number) => applicationsApi.cancel(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      toast.success('Заявка отменена')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? 'Ошибка при отмене')
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Skeleton className="h-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <ErrorState message="Не удалось загрузить мероприятие" onRetry={refetch} />
      </div>
    )
  }

  if (!data) return null

  const statusInfo = existingApplication
    ? STATUS_LABELS[existingApplication.status]
    : null

  const canCancel = existingApplication &&
    (existingApplication.status === 'pending' || existingApplication.status === 'confirmed')

  const canApply = !existingApplication || !!cancelledApplication

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Назад */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
        style={{ color: '#94A3B8' }}
      >
        <ArrowLeft size={15} /> Все мероприятия
      </Link>

      {/* Шапка */}
      <div className="rounded-2xl p-8 text-white mb-6" style={{ background: '#0D1F3C' }}>
        <span
          className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
          style={{ background: '#F5A623', color: '#0D1F3C' }}
        >
          {data.sport_type}
        </span>
        <h1 className="text-3xl font-bold mb-5">{data.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm" style={{ color: '#A0AEC0' }}>
          <div className="flex items-center gap-2">
            <Clock size={15} />
            <span>{format(new Date(data.time_start), 'd MMMM, HH:mm', { locale: ru })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={15} />
            <span>{data.location}</span>
          </div>
          {data.max_participants && (
            <div className="flex items-center gap-2">
              <Users size={15} />
              <span>До {data.max_participants} участников</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Основной контент */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Описание */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
            <h2 className="font-bold mb-3" style={{ color: '#0D1F3C' }}>О мероприятии</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#64748B' }}>
              {data.description}
            </p>
          </div>

          {/* Инструктор */}
          {data.instructor_name && (
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
              <h2 className="font-bold mb-3" style={{ color: '#0D1F3C' }}>Инструктор</h2>
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#0D1F3C' }}
                >
                  <User size={18} color="#F5A623" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#0D1F3C' }}>{data.instructor_name}</p>
                  {data.instructor_bio && (
                    <p className="text-sm mt-1" style={{ color: '#64748B' }}>{data.instructor_bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Призы */}
          {data.prizes && (
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
              <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#0D1F3C' }}>
                <Trophy size={16} color="#F5A623" />
                Призы и награды
              </h2>
              <p className="text-sm" style={{ color: '#64748B' }}>{data.prizes}</p>
            </div>
          )}
        </div>

        {/* Сайдбар */}
        <div className="flex flex-col gap-4">

          {/* Блок участия */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
            <h2 className="font-bold mb-4" style={{ color: '#0D1F3C' }}>Участие</h2>

            {/* Возраст */}
            <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>
              {data.min_age || data.max_age
                ? `Возраст: ${data.min_age ?? '0'}–${data.max_age ?? '∞'} лет`
                : 'Для всех возрастов'}
            </p>

            {/* Статус заявки */}
            {statusInfo && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 text-sm font-medium"
                style={{ background: statusInfo.bg, color: statusInfo.color }}
              >
                <CheckCircle size={15} />
                {statusInfo.label}
              </div>
            )}

            {/* Кнопки */}
            {!isAuth ? (
              <button
  onClick={() => navigate({
    to: '/auth/login',
    state: { from: `/events/${id}` },
  })}
  className="block text-center w-full py-3 rounded-xl text-sm font-semibold text-white"
  style={{ background: '#0D1F3C' }}
>
  Войдите чтобы записаться
</button>
            ) : canApply ? (
              <>
                {error && (
                  <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                    {error}
                  </p>
                )}
                <button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ background: '#0D1F3C' }}
                >
                  {applyMutation.isPending ? 'Отправка...' : cancelledApplication ? 'Подать заявку снова' : 'Подать заявку'}
                </button>
              </>
            ) : canCancel ? (
              <button
                onClick={() => cancelMutation.mutate(existingApplication!.id)}
                disabled={cancelMutation.isPending}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#FEF2F2', color: '#DC2626' }}
              >
                <X size={15} />
                {cancelMutation.isPending ? 'Отмена...' : 'Отменить заявку'}
              </button>
            ) : null}

            <p className="text-xs mt-3 text-center" style={{ color: '#94A3B8' }}>
              Отмена не позднее чем за {data.cancel_deadline_hrs} ч до начала
            </p>
          </div>

          {/* Детали */}
          <div className="bg-white rounded-2xl p-5 text-sm flex flex-col gap-3" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex justify-between">
              <span style={{ color: '#94A3B8' }}>Начало</span>
              <span className="font-semibold" style={{ color: '#0D1F3C' }}>
                {format(new Date(data.time_start), 'd MMM, HH:mm', { locale: ru })}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#94A3B8' }}>Конец</span>
              <span className="font-semibold" style={{ color: '#0D1F3C' }}>
                {format(new Date(data.time_end), 'd MMM, HH:mm', { locale: ru })}
              </span>
            </div>
            {data.max_participants && (
              <div className="flex justify-between">
                <span style={{ color: '#94A3B8' }}>Мест</span>
                <span className="font-semibold" style={{ color: '#0D1F3C' }}>{data.max_participants}</span>
              </div>
            )}
          </div>
        </div>
        {/* Карта */}
{data.location_lat && data.location_lng && (
  <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #E2E8F0' }}>
      <MapPin size={14} color="#94A3B8" />
      <span className="text-xs font-semibold" style={{ color: '#64748B' }}>Место проведения</span>
    </div>
    <EventMap
      lat={data.location_lat}
      lng={data.location_lng}
      label={data.location}
    />
    <div className="px-4 py-2.5">
      <p className="text-xs" style={{ color: '#64748B' }}>{data.location}</p>
    </div>
  </div>
)}
      </div>
    </div>
  )
}