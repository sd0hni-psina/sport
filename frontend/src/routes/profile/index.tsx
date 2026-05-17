import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { applicationsApi } from '@/api/applications'
import { authStore } from '@/store/auth'
import { authApi } from '@/api/auth'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { User, Star, Calendar, LogOut, ChevronRight } from 'lucide-react'
import type { User as UserType, Application } from '@/types'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:            { label: 'Ожидает',   color: 'bg-yellow-50 text-yellow-700' },
  confirmed:          { label: 'Подтверждена', color: 'bg-green-50 text-green-700' },
  cancelled_by_user:  { label: 'Отменена вами', color: 'bg-gray-100 text-gray-500' },
  cancelled_by_admin: { label: 'Отменена', color: 'bg-red-50 text-red-500' },
  no_show:            { label: 'Не явился', color: 'bg-red-50 text-red-500' },
  attended:           { label: 'Посетил',   color: 'bg-blue-50 text-blue-700' },
}

function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // редирект если не авторизован
  if (!authStore.isAuthenticated()) {
    navigate({ to: '/auth/login' })
    return null
  }

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get<{ data: UserType }>('/me').then(r => r.data.data),
  })

  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationsApi.myApplications().then(r => r.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-applications'] }),
  })

  async function handleLogout() {
    await authApi.logout()
    authStore.clearTokens()
    queryClient.clear()
    navigate({ to: '/' })
  }

  const applications = applicationsData?.data ?? []

  if (userLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!user) return null

  const fullName = [user.last_name, user.first_name, user.middle_name].filter(Boolean).join(' ')

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Профиль</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Левая колонка — инфо */}
        <div className="flex flex-col gap-4">

          {/* Аватар и имя */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-3">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={36} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{fullName}</p>
              <p className="text-sm text-gray-500">{user.phone_number}</p>
              <p className="text-sm text-gray-500">{user.city}</p>
            </div>
            {user.role === 'admin' && (
              <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
                Администратор
              </span>
            )}
          </div>

          {/* Репутация */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} className="text-yellow-500" />
              <span className="font-bold text-gray-900">Репутация</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">{user.reputation}</span>
              <span className="text-gray-400 text-sm mb-1">/ 100</span>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                style={{ width: `${Math.min(user.reputation, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Снижается при пропуске мероприятий
            </p>
          </div>

          {/* Дата рождения */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Дата рождения</span>
            </div>
            <p className="text-gray-900 font-medium">
              {format(new Date(user.birth_date), 'd MMMM yyyy', { locale: ru })}
            </p>
          </div>

          {/* Выход */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </div>

        {/* Правая колонка — заявки */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Мои заявки</h2>

            {appsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Заявок пока нет</p>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 mt-2 hover:underline"
                >
                  Найти мероприятие <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {applications.map((app: Application) => {
                  const statusInfo = STATUS_LABELS[app.status] ?? { label: app.status, color: 'bg-gray-100 text-gray-500' }
                  const canCancel = app.status === 'pending' || app.status === 'confirmed'

                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <Link
                          to="/events/$id"
                          params={{ id: String(app.event_id) }}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          Мероприятие #{app.event_id}
                        </Link>
                        <p className="text-xs text-gray-400">
                          {format(new Date(app.created_at), 'd MMM yyyy', { locale: ru })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {canCancel && (
                          <button
                            onClick={() => cancelMutation.mutate(app.id)}
                            disabled={cancelMutation.isPending}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            Отменить
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}