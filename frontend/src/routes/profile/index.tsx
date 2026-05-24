import { createFileRoute, useNavigate, Link, redirect } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { applicationsApi } from '@/api/applications'
import { authStore } from '@/store/auth'
import { authApi } from '@/api/auth'
import { eventsApi } from '@/api/events'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { User, Star, Calendar, LogOut, ChevronRight, Pencil, Plus, Trash2, X, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/shared/Skeleton'
import type { User as UserType, Application, Child } from '@/types'
import { awardsApi } from '@/api/awards'
import type { Award } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'
import { logout } from '@/lib/logout'


export const Route = createFileRoute('/profile/')({
  beforeLoad: ({ location }) => {
    if (!authStore.isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
        state: { from: location.href },
      })
    }
  },
  component: ProfilePage,
})

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:            { label: 'Ожидает',      color: 'bg-yellow-50 text-yellow-700' },
  confirmed:          { label: 'Подтверждена', color: 'bg-green-50 text-green-700'   },
  cancelled_by_user:  { label: 'Отменена',     color: 'bg-gray-100 text-gray-500'    },
  cancelled_by_admin: { label: 'Отменена',     color: 'bg-red-50 text-red-500'       },
  no_show:            { label: 'Не явился',    color: 'bg-red-50 text-red-500'       },
  attended:           { label: 'Посетил',      color: 'bg-blue-50 text-blue-700'     },
}

function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingProfile, setEditingProfile] = useState(false)
  const [addingChild, setAddingChild] = useState(false)
  const [editingChildId, setEditingChildId] = useState<number | null>(null)

  const [profileForm, setProfileForm] = useState({
    first_name: '', last_name: '', middle_name: '', city: '', address: '',
  })

  const [childForm, setChildForm] = useState({
    first_name: '', last_name: '', middle_name: '', birth_date: '',
  })

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get<{ data: UserType }>('/me').then(r => r.data.data),
  })

  const { data: childrenData } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => apiClient.get<{ data: Child[] }>('/me/children').then(r => r.data),
  })

  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationsApi.myApplications().then(r => r.data),
  })

  const { data: awardsData } = useQuery({
  queryKey: ['my-awards'],
  queryFn: () => awardsApi.myAwards().then(r => r.data),
  })

  const awards: Award[] = awardsData?.data ?? []

  const eventIds = [...new Set((applicationsData?.data ?? []).map((a: Application) => a.event_id))]
  const { data: eventsMap } = useQuery({
    queryKey: ['events-by-ids', eventIds],
    queryFn: async () => {
      const events = await eventsApi.getByIds(eventIds)
      return Object.fromEntries(events.map(e => [e.id, e]))
    },
    enabled: eventIds.length > 0,
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: Record<string, any>) => apiClient.put('/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setEditingProfile(false)
      toast.success('Профиль обновлён')
    },
    onError: () => toast.error('Ошибка при обновлении профиля'),
  })

  const addChildMutation = useMutation({
    mutationFn: (data: Record<string, any>) => apiClient.post('/me/children', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-children'] })
      setAddingChild(false)
      setChildForm({ first_name: '', last_name: '', middle_name: '', birth_date: '' })
      toast.success('Ребёнок добавлен')
    },
    onError: () => toast.error('Ошибка при добавлении'),
  })

  const updateChildMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      apiClient.put(`/me/children/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-children'] })
      setEditingChildId(null)
      toast.success('Данные ребёнка обновлены')
    },
    onError: () => toast.error('Ошибка при обновлении'),
  })

  const deleteChildMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/me/children/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-children'] })
      toast.success('Ребёнок удалён')
    },
    onError: () => toast.error('Ошибка при удалении'),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      toast.success('Заявка отменена')
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Ошибка при отмене'),
  })

  async function handleLogout() {
    await logout(queryClient, navigate)
  }

  function startEditProfile() {
    if (!user) return
    setProfileForm({
      first_name:  user.first_name,
      last_name:   user.last_name,
      middle_name: user.middle_name ?? '',
      city:        user.city,
      address:     user.address ?? '',
    })
    setEditingProfile(true)
  }

  function startEditChild(child: Child) {
    setChildForm({
      first_name:  child.first_name,
      last_name:   child.last_name,
      middle_name: child.middle_name ?? '',
      birth_date:  format(new Date(child.birth_date), 'yyyy-MM-dd'),
    })
    setEditingChildId(child.id)
  }

  const inputClass = "w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
  const inputStyle = { border: '1px solid #E2E8F0', color: '#0D1F3C' }

  const applications = applicationsData?.data ?? []
  const children: Child[] = childrenData?.data ?? []

  if (userLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Skeleton className="h-32" count={1} />
        <div className="mt-4">
          <Skeleton className="h-64" count={1} />
        </div>
      </div>
    )
  }

  if (!user) return null

  const fullName = [user.last_name, user.first_name, user.middle_name].filter(Boolean).join(' ')

  return (
    <>
    <PageMeta title="Профиль" />
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#0D1F3C' }}>Профиль</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Левая колонка */}
        <div className="flex flex-col gap-4">

          {/* Карточка профиля */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#0D1F3C' }}>
                <User size={28} color="#F5A623" />
              </div>
              <button
                onClick={editingProfile ? () => setEditingProfile(false) : startEditProfile}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: '#F1F5F9', color: '#64748B' }}
              >
                {editingProfile ? <X size={14} /> : <Pencil size={14} />}
              </button>
            </div>

            {editingProfile ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Имя</label>
                    <input
                      value={profileForm.first_name}
                      onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                      className={inputClass} style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Фамилия</label>
                    <input
                      value={profileForm.last_name}
                      onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                      className={inputClass} style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Отчество</label>
                  <input
                    value={profileForm.middle_name}
                    onChange={e => setProfileForm(p => ({ ...p, middle_name: e.target.value }))}
                    className={inputClass} style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Город</label>
                  <input
                    value={profileForm.city}
                    onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))}
                    className={inputClass} style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Адрес</label>
                  <input
                    value={profileForm.address}
                    onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                    className={inputClass} style={inputStyle}
                  />
                </div>
                <button
                  onClick={() => updateProfileMutation.mutate({
                    first_name:  profileForm.first_name,
                    last_name:   profileForm.last_name,
                    middle_name: profileForm.middle_name || undefined,
                    city:        profileForm.city,
                    address:     profileForm.address || undefined,
                  })}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: '#0D1F3C' }}
                >
                  <Check size={14} />
                  {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            ) : (
              <div>
                <p className="font-bold text-lg" style={{ color: '#0D1F3C' }}>{fullName}</p>
                <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>{user.phone_number}</p>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{user.city}</p>
                {user.address && <p className="text-sm" style={{ color: '#94A3B8' }}>{user.address}</p>}
                {user.role === 'admin' && (
                  <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#0D1F3C', color: '#F5A623' }}>
                    Администратор
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Репутация */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} color="#F5A623" />
              <span className="font-semibold text-sm" style={{ color: '#0D1F3C' }}>Репутация</span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold" style={{ color: '#0D1F3C' }}>{user.reputation}</span>
              <span className="text-sm mb-0.5" style={{ color: '#94A3B8' }}>/ 100</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(user.reputation, 100)}%`, background: user.reputation >= 70 ? '#059669' : user.reputation >= 40 ? '#D97706' : '#DC2626' }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>Снижается при пропуске мероприятий</p>
          </div>

          {/* Дата рождения */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} color="#94A3B8" />
              <span className="text-xs font-medium" style={{ color: '#64748B' }}>Дата рождения</span>
            </div>
            <p className="font-semibold text-sm" style={{ color: '#0D1F3C' }}>
              {format(new Date(user.birth_date), 'd MMMM yyyy', { locale: ru })}
            </p>
          </div>

          {/* Дети */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-sm" style={{ color: '#0D1F3C' }}>Дети</span>
              <button
                onClick={() => { setAddingChild(true); setEditingChildId(null) }}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#F1F5F9', color: '#64748B' }}
              >
                <Plus size={13} />
              </button>
            </div>

            {children.length === 0 && !addingChild ? (
              <p className="text-xs" style={{ color: '#94A3B8' }}>Детей нет</p>
            ) : (
              <div className="flex flex-col gap-3">
                {children.map((child: Child) => (
                  <div key={child.id}>
                    {editingChildId === child.id ? (
                      <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ background: '#F8FAFC' }}>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={childForm.first_name}
                            onChange={e => setChildForm(p => ({ ...p, first_name: e.target.value }))}
                            placeholder="Имя"
                            className={inputClass} style={inputStyle}
                          />
                          <input
                            value={childForm.last_name}
                            onChange={e => setChildForm(p => ({ ...p, last_name: e.target.value }))}
                            placeholder="Фамилия"
                            className={inputClass} style={inputStyle}
                          />
                        </div>
                        <input
                          type="date"
                          value={childForm.birth_date}
                          onChange={e => setChildForm(p => ({ ...p, birth_date: e.target.value }))}
                          className={inputClass} style={inputStyle}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingChildId(null)}
                            className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: '#F1F5F9', color: '#64748B' }}
                          >
                            Отмена
                          </button>
                          <button
                            onClick={() => updateChildMutation.mutate({
                              id: child.id,
                              data: {
                                first_name: childForm.first_name,
                                last_name:  childForm.last_name,
                                birth_date: childForm.birth_date || undefined,
                              },
                            })}
                            disabled={updateChildMutation.isPending}
                            className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                            style={{ background: '#0D1F3C' }}
                          >
                            Сохранить
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#0D1F3C' }}>
                            {child.first_name} {child.last_name}
                          </p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>
                            {format(new Date(child.birth_date), 'd MMM yyyy', { locale: ru })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditChild(child)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: '#EFF6FF', color: '#2563EB' }}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => deleteChildMutation.mutate(child.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: '#FEF2F2', color: '#DC2626' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingChild && (
                  <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={childForm.first_name}
                        onChange={e => setChildForm(p => ({ ...p, first_name: e.target.value }))}
                        placeholder="Имя"
                        className={inputClass} style={inputStyle}
                      />
                      <input
                        value={childForm.last_name}
                        onChange={e => setChildForm(p => ({ ...p, last_name: e.target.value }))}
                        placeholder="Фамилия"
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                    <input
                      value={childForm.middle_name}
                      onChange={e => setChildForm(p => ({ ...p, middle_name: e.target.value }))}
                      placeholder="Отчество (необязательно)"
                      className={inputClass} style={inputStyle}
                    />
                    <input
                      type="date"
                      value={childForm.birth_date}
                      onChange={e => setChildForm(p => ({ ...p, birth_date: e.target.value }))}
                      className={inputClass} style={inputStyle}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setAddingChild(false); setChildForm({ first_name: '', last_name: '', middle_name: '', birth_date: '' }) }}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: '#F1F5F9', color: '#64748B' }}
                      >
                        Отмена
                      </button>
                      <button
                        onClick={() => addChildMutation.mutate({
                          first_name:  childForm.first_name,
                          last_name:   childForm.last_name,
                          middle_name: childForm.middle_name || undefined,
                          birth_date:  childForm.birth_date,
                        })}
                        disabled={addChildMutation.isPending}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                        style={{ background: '#0D1F3C' }}
                      >
                        {addChildMutation.isPending ? '...' : 'Добавить'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Выход */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium border transition-colors"
            style={{ borderColor: '#FECACA', color: '#DC2626' }}
          >
            <LogOut size={15} />
            Выйти
          </button>
        </div>

        {/* Правая колонка — заявки */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
            <h2 className="font-bold text-lg mb-5" style={{ color: '#0D1F3C' }}>Мои заявки</h2>

            {appsLoading ? (
              <Skeleton className="h-16" count={3} />
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={32} className="mx-auto mb-3 opacity-20" color="#0D1F3C" />
                <p className="font-medium text-sm" style={{ color: '#94A3B8' }}>Заявок пока нет</p>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-1 text-sm mt-2 font-medium"
                  style={{ color: '#2563EB' }}
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
                      className="flex items-center justify-between gap-4 p-4 rounded-xl"
                      style={{ border: '1px solid #E2E8F0' }}
                    >
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <Link
                          to="/events/$id"
                          params={{ id: String(app.event_id) }}
                          className="text-sm font-semibold hover:underline transition-colors truncate"
                          style={{ color: '#0D1F3C' }}
                        >
                          {eventsMap?.[app.event_id]?.name ?? `Мероприятие #${app.event_id}`}
                        </Link>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>
                          {format(new Date(app.created_at), 'd MMM yyyy', { locale: ru })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {canCancel && (
                          <button
                            onClick={() => cancelMutation.mutate(app.id)}
                            disabled={cancelMutation.isPending}
                            className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                            style={{ background: '#FEF2F2', color: '#DC2626' }}
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
        {/* Ссылка на предстоящие */}
<Link
  to="/profile/upcoming"
  className="flex items-center justify-between p-4 rounded-xl mb-4 transition-colors hover:shadow-md"
  style={{ background: '#0D1F3C', border: '1px solid #1A3259' }}
>
  <div className="flex items-center gap-3">
    <Calendar size={18} color="#F5A623" />
    <div>
      <p className="text-sm font-semibold text-white">Предстоящие мероприятия</p>
      <p className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>Мероприятия на которые вы записаны</p>
    </div>
  </div>
  <ChevronRight size={16} color="#7A8FA8" />
</Link>
        {/* Награды */}
{awards.length > 0 && (
  <div className="bg-white rounded-2xl p-6 mt-5" style={{ border: '1px solid #E2E8F0' }}>
    <h2 className="font-bold text-lg mb-5" style={{ color: '#0D1F3C' }}>Мои награды</h2>
    <div className="flex flex-col gap-3">
      {awards.map((award: Award) => (
        <div
          key={award.id}
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: '#FFF8E7', border: '1px solid #FDE68A' }}
        >
          <span className="text-2xl">
            {award.type === 'medal' ? '🥇' : award.type === 'diploma' ? '📜' : '🏆'}
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#0D1F3C' }}>
              {award.type === 'medal' ? 'Медаль' : award.type === 'diploma' ? 'Диплом' : 'Сертификат'}
            </p>
            <p className="text-xs" style={{ color: '#D97706' }}>{award.description}</p>
          </div>
          <p className="text-xs ml-auto" style={{ color: '#94A3B8' }}>
            {format(new Date(award.issued_at), 'd MMM yyyy', { locale: ru })}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      </div>
    </div>
    </>
  )
}