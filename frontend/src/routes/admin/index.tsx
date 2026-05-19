import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'
import { apiClient } from '@/api/client'
import { Calendar, Users, ClipboardList, FileText, Plus, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { data: counters } = useQuery({
    queryKey: ['stats'],
    queryFn: () => analyticsApi.getCounters().then(r => r.data),
  })

  const { data: appsData } = useQuery({
    queryKey: ['admin-applications-recent'],
    queryFn: () => apiClient.get('/admin/applications?event_id=1').then(r => r.data),
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Дашборд</h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Обзор платформы</p>
      </div>

      {/* Статы */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Мероприятий',  value: counters?.total_events ?? '—',        icon: Calendar,      color: '#2563EB' },
          { label: 'Участников',   value: counters?.total_participants ?? '—',   icon: Users,         color: '#059669' },
          { label: 'Заявок',       value: '—',                                  icon: ClipboardList, color: '#D97706' },
          { label: 'Новостей',     value: '—',                                  icon: FileText,      color: '#7C3AED' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>{s.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + '15' }}>
                <s.icon size={16} color={s.color} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/admin/events/new"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl transition-shadow hover:shadow-md"
          style={{ border: '1px solid #E2E8F0' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#0D1F3C' }}>
            <Plus size={18} color="#F5A623" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: '#0D1F3C' }}>Создать мероприятие</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Добавить новое событие</p>
          </div>
          <ArrowRight size={16} color="#94A3B8" />
        </Link>

        <Link
          to="/admin/news/new"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl transition-shadow hover:shadow-md"
          style={{ border: '1px solid #E2E8F0' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#0D1F3C' }}>
            <Plus size={18} color="#F5A623" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: '#0D1F3C' }}>Написать новость</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Опубликовать материал</p>
          </div>
          <ArrowRight size={16} color="#94A3B8" />
        </Link>
      </div>

      {/* Ссылки на разделы */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/events',       label: 'Мероприятия',  icon: Calendar      },
          { to: '/admin/applications', label: 'Заявки',       icon: ClipboardList },
          { to: '/admin/users',        label: 'Пользователи', icon: Users         },
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center justify-between p-4 bg-white rounded-xl transition-shadow hover:shadow-md"
            style={{ border: '1px solid #E2E8F0' }}
          >
            <div className="flex items-center gap-3">
              <Icon size={16} color="#94A3B8" />
              <span className="text-sm font-medium" style={{ color: '#0D1F3C' }}>{label}</span>
            </div>
            <ArrowRight size={14} color="#94A3B8" />
          </Link>
        ))}
      </div>
    </div>
  )
}