import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/api/events'
import { applicationsApi } from '@/api/applications'
import { authStore } from '@/store/auth'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MapPin, Clock, Users, Trophy, User, ArrowLeft } from 'lucide-react'
import { useState } from 'react'


export const Route = createFileRoute('/events/$id')({
  component: EventPage,
})

function EventPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const isAuth = authStore.isAuthenticated()
  const { data: myApps } = useQuery({
  queryKey: ['my-applications'],
  queryFn: () => applicationsApi.myApplications().then(r => r.data),
  enabled: isAuth,
})

const existingApplication = myApps?.data?.find(
  a => a.event_id === Number(id) &&
    a.status !== 'cancelled_by_user' &&
    a.status !== 'cancelled_by_admin'
)
const applied = !!existingApplication
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(Number(id)).then(r => r.data.data),
  })

  const applyMutation = useMutation({
    mutationFn: () => applicationsApi.apply(Number(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'Ошибка при подаче заявки')
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse mb-6" />
        <div className="h-8 bg-gray-100 rounded animate-pulse mb-3 w-2/3" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        Мероприятие не найдено
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Назад */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Все мероприятия
      </Link>

      {/* Шапка */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-6">
        <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
          {data.sport_type}
        </span>
        <h1 className="text-3xl font-bold mb-4">{data.name}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{format(new Date(data.time_start), 'd MMMM, HH:mm', { locale: ru })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{data.location}</span>
          </div>
          {data.max_participants && (
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>До {data.max_participants} участников</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основной контент */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Описание */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-3">О мероприятии</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{data.description}</p>
          </div>

          {/* Инструктор */}
          {data.instructor_name && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-3">Инструктор</h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{data.instructor_name}</p>
                  {data.instructor_bio && (
                    <p className="text-sm text-gray-500 mt-1">{data.instructor_bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Призы */}
          {data.prizes && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                Призы и награды
              </h2>
              <p className="text-gray-600">{data.prizes}</p>
            </div>
          )}
        </div>

        {/* Сайдбар */}
        <div className="flex flex-col gap-4">
          {/* Кнопка записи */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Участие</h2>

            {data.min_age || data.max_age ? (
              <p className="text-sm text-gray-500 mb-3">
                Возраст: {data.min_age ?? '0'}–{data.max_age ?? '∞'} лет
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-3">Для всех возрастов</p>
            )}

            {applied ? (
              <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm font-medium text-center">
                Заявка подана ✓
              </div>
            ) : !isAuth ? (
              <Link
                to="/auth/login"
                className="block text-center w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Войдите чтобы записаться
              </Link>
            ) : (
              <>
                {error && (
                  <p className="text-sm text-red-500 mb-3">{error}</p>
                )}
                <button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {applyMutation.isPending ? 'Отправка...' : 'Подать заявку'}
                </button>
              </>
            )}

            <p className="text-xs text-gray-400 mt-3 text-center">
              Отмена не позднее чем за {data.cancel_deadline_hrs} ч до начала
            </p>
          </div>

          {/* Детали */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-500 flex flex-col gap-2">
            <div className="flex justify-between">
              <span>Начало</span>
              <span className="text-gray-900 font-medium">
                {format(new Date(data.time_start), 'd MMM, HH:mm', { locale: ru })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Конец</span>
              <span className="text-gray-900 font-medium">
                {format(new Date(data.time_end), 'd MMM, HH:mm', { locale: ru })}
              </span>
            </div>
            {data.max_participants && (
              <div className="flex justify-between">
                <span>Мест</span>
                <span className="text-gray-900 font-medium">{data.max_participants}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}