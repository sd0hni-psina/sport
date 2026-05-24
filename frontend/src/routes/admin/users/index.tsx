import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Search, ShieldOff, Shield, X, Star, Calendar, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import type { User, Application } from '@/types'

export const Route = createFileRoute('/admin/users/')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get<{ data: User[] }>('/admin/users').then(r => r.data),
  })

  const { data: userApps } = useQuery({
    queryKey: ['admin-user-apps', selectedUser?.id],
    queryFn: () => apiClient.get<{ data: Application[] }>(`/me/applications`).then(r => r.data),
    enabled: false, // не загружаем — нет эндпоинта для конкретного юзера
  })


  const blockMutation = useMutation({
    mutationFn: ({ id, block }: { id: number; block: boolean }) =>
      apiClient.patch(`/admin/users/${id}/${block ? 'block' : 'unblock'}`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      if (selectedUser) {
        setSelectedUser(prev => prev ? { ...prev, is_blocked: vars.block } : null)
      }
      toast.success(vars.block ? 'Пользователь заблокирован' : 'Пользователь разблокирован')
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Ошибка'),
  })

  const users: User[] = (data?.data ?? []).filter((u: User) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      u.phone_number.includes(q)
    )
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Пользователи</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{users.length} пользователей</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
        <input
          type="text"
          placeholder="Поиск по имени или телефону..."
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
          <Skeleton className="h-16" count={5} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="Пользователей не найдено" />
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user: User) => (
            <div
              key={user.id}
              className="bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
              style={{ border: '1px solid #E2E8F0', opacity: user.is_blocked ? 0.6 : 1 }}
              onClick={() => setSelectedUser(user)}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                style={{
                  background: user.is_blocked ? '#F1F5F9' : '#0D1F3C',
                  color: user.is_blocked ? '#94A3B8' : '#F5A623',
                }}
              >
                {user.first_name[0]}{user.last_name[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold truncate" style={{ color: '#0D1F3C' }}>
                    {user.last_name} {user.first_name} {user.middle_name ?? ''}
                  </p>
                  {user.role === 'admin' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#0D1F3C', color: '#F5A623' }}>
                      Админ
                    </span>
                  )}
                  {user.is_blocked && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                      Заблокирован
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                  <span>{user.phone_number}</span>
                  <span>·</span>
                  <span>Репутация: {user.reputation}</span>
                  <span>·</span>
                  <span>С {format(new Date(user.created_at), 'd MMM yyyy', { locale: ru })}</span>
                </div>
              </div>

              {user.role !== 'admin' && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    blockMutation.mutate({ id: user.id, block: !user.is_blocked })
                  }}
                  disabled={blockMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
                  style={user.is_blocked
                    ? { background: '#ECFDF5', color: '#059669' }
                    : { background: '#FEF2F2', color: '#DC2626' }
                  }
                >
                  {user.is_blocked
                    ? <><Shield size={13} /> Разблокировать</>
                    : <><ShieldOff size={13} /> Заблокировать</>
                  }
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Модал профиля пользователя */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Шапка */}
            <div className="p-6 flex items-start justify-between" style={{ background: '#0D1F3C' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: '#F5A623', color: '#0D1F3C' }}
                >
                  {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                </div>
                <div>
                  <p className="font-bold text-white">
                    {selectedUser.last_name} {selectedUser.first_name} {selectedUser.middle_name ?? ''}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedUser.role === 'admin' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F5A623', color: '#0D1F3C' }}>
                        Админ
                      </span>
                    )}
                    {selectedUser.is_blocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                        Заблокирован
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#1A3259', color: '#7A8FA8' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Детали */}
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>Телефон</p>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} color="#94A3B8" />
                    <p className="text-sm font-medium" style={{ color: '#0D1F3C' }}>{selectedUser.phone_number}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>Город</p>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} color="#94A3B8" />
                    <p className="text-sm font-medium" style={{ color: '#0D1F3C' }}>{selectedUser.city}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>Дата рождения</p>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} color="#94A3B8" />
                    <p className="text-sm font-medium" style={{ color: '#0D1F3C' }}>
                      {format(new Date(selectedUser.birth_date), 'd MMM yyyy', { locale: ru })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>Репутация</p>
                  <div className="flex items-center gap-1.5">
                    <Star size={13} color="#F5A623" />
                    <p className="text-sm font-bold" style={{ color: '#0D1F3C' }}>{selectedUser.reputation} / 100</p>
                  </div>
                </div>
              </div>

              {/* Прогресс репутации */}
              <div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(selectedUser.reputation, 100)}%`,
                      background: selectedUser.reputation >= 70 ? '#059669' :
                        selectedUser.reputation >= 40 ? '#D97706' : '#DC2626',
                    }}
                  />
                </div>
                <p className="text-xs mt-1.5" style={{ color: '#94A3B8' }}>
                  Зарегистрирован {format(new Date(selectedUser.created_at), 'd MMMM yyyy', { locale: ru })}
                </p>
              </div>

              {/* Блок активности */}
<div
  className="flex items-center justify-between p-3 rounded-xl"
  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
>
  <div className="text-center flex-1">
    <p className="text-lg font-bold" style={{ color: '#0D1F3C' }}>
      {selectedUser.reputation}
    </p>
    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>репутация</p>
  </div>
  <div className="w-px h-8" style={{ background: '#E2E8F0' }} />
  <div className="text-center flex-1">
    <p className="text-lg font-bold" style={{ color: '#0D1F3C' }}>
      {selectedUser.is_blocked ? '🔒' : '✓'}
    </p>
    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
      {selectedUser.is_blocked ? 'заблокирован' : 'активен'}
    </p>
  </div>
  <div className="w-px h-8" style={{ background: '#E2E8F0' }} />
  <div className="text-center flex-1">
    <p className="text-lg font-bold" style={{ color: '#0D1F3C' }}>
      {selectedUser.role === 'admin' ? '👑' : '👤'}
    </p>
    <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
      {selectedUser.role === 'admin' ? 'админ' : 'пользователь'}
    </p>
  </div>
</div>

              {/* Кнопки действий */}
              {selectedUser.role !== 'admin' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => blockMutation.mutate({ id: selectedUser.id, block: !selectedUser.is_blocked })}
                    disabled={blockMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    style={selectedUser.is_blocked
                      ? { background: '#ECFDF5', color: '#059669' }
                      : { background: '#FEF2F2', color: '#DC2626' }
                    }
                  >
                    {selectedUser.is_blocked
                      ? <><Shield size={15} /> Разблокировать</>
                      : <><ShieldOff size={15} /> Заблокировать</>
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}