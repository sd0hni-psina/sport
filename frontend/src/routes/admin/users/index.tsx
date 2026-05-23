import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Search, ShieldOff, Shield } from 'lucide-react'
import { useState } from 'react'
import type { User } from '@/types'
import { toast } from 'sonner'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/shared/Skeleton'


export const Route = createFileRoute('/admin/users/')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading, isError, refetch  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get<{ data: User[] }>('/admin/users').then(r => r.data),
  })

  const blockMutation = useMutation({
  mutationFn: ({ id, block }: { id: number; block: boolean }) =>
    apiClient.patch(`/admin/users/${id}/${block ? 'block' : 'unblock'}`),
  onSuccess: (_, vars) => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    toast.success(vars.block ? 'Пользователь заблокирован' : 'Пользователь разблокирован')
  },
  onError: (err: any) => {
    toast.error(err.response?.data?.error ?? 'Ошибка')
  },
})

  const users: User[] = (data?.data ?? []).filter((u: User) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q)  ||
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

      {/* Поиск */}
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
              className="bg-white rounded-xl p-4 flex items-center gap-4"
              style={{
                border: '1px solid #E2E8F0',
                opacity: user.is_blocked ? 0.6 : 1,
              }}
            >
              {/* Аватар */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                style={{ background: user.is_blocked ? '#F1F5F9' : '#0D1F3C', color: user.is_blocked ? '#94A3B8' : '#F5A623' }}
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
                  onClick={() => blockMutation.mutate({ id: user.id, block: !user.is_blocked })}
                  disabled={blockMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
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
    </div>
  )
}