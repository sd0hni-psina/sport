import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import {
  Calendar, Users, ClipboardList, FileText,
  Plus, ArrowRight, Clock, CheckCircle,
} from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { PageMeta } from '@/components/shared/PageMeta'


export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => apiClient.get<{ data: Record<string, number> }>('/admin/summary').then(r => r.data.data),
  })

  const stats = [
    {
      label:    'Мероприятий',
      value:    data?.total_events,
      sub:      `${data?.published_events ?? 0} опубликовано`,
      icon:     Calendar,
      color:    '#2563EB',
    },
    {
      label:    'Заявок',
      value:    data?.total_applications,
      sub:      `${data?.pending_applications ?? 0} ожидают`,
      icon:     ClipboardList,
      color:    '#D97706',
    },
    {
      label:    'Пользователей',
      value:    data?.total_users,
      sub:      'зарегистрировано',
      icon:     Users,
      color:    '#059669',
    },
    {
      label:    'Новостей',
      value:    data?.total_news,
      sub:      `${data?.published_news ?? 0} опубликовано`,
      icon:     FileText,
      color:    '#7C3AED',
    },
  ]

  return (
    <>
    <PageMeta title="Дашборд — Админ" />
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Дашборд</h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Обзор платформы</p>
      </div>

      {/* Статы */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          <Skeleton className="h-28" count={4} />
        ) : (
          stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>{s.label}</p>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: s.color + '15' }}
                >
                  <s.icon size={16} color={s.color} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-0.5" style={{ color: '#0D1F3C' }}>
                {s.value ?? '—'}
              </p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>{s.sub}</p>
            </div>
          ))
        )}
      </div>

      {/* Ожидающие заявки — алерт если есть */}
      {(data?.pending_applications ?? 0) > 0 && (
        <Link
          to="/admin/applications"
          className="flex items-center gap-4 p-4 rounded-2xl mb-6 transition-shadow hover:shadow-md"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#F5A623' }}
          >
            <Clock size={18} color="#0D1F3C" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: '#0D1F3C' }}>
              {data?.pending_applications} заявок ожидают подтверждения
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#D97706' }}>
              Нажмите чтобы перейти к заявкам
            </p>
          </div>
          <ArrowRight size={16} color="#D97706" />
        </Link>
      )}

      {/* Быстрые действия */}
      <h2 className="text-sm font-bold mb-4" style={{ color: '#94A3B8' }}>БЫСТРЫЕ ДЕЙСТВИЯ</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/admin/events/new"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl transition-shadow hover:shadow-md"
          style={{ border: '1px solid #E2E8F0' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#0D1F3C' }}
          >
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
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#0D1F3C' }}
          >
            <Plus size={18} color="#F5A623" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: '#0D1F3C' }}>Написать новость</p>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Опубликовать материал</p>
          </div>
          <ArrowRight size={16} color="#94A3B8" />
        </Link>
      </div>

      {/* Навигация по разделам */}
      <h2 className="text-sm font-bold mb-4" style={{ color: '#94A3B8' }}>РАЗДЕЛЫ</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/events',       label: 'Мероприятия',  icon: Calendar,      value: data?.total_events      },
          { to: '/admin/applications', label: 'Заявки',       icon: ClipboardList, value: data?.total_applications },
          { to: '/admin/users',        label: 'Пользователи', icon: Users,         value: data?.total_users        },
        ].map(({ to, label, icon: Icon, value }) => (
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
            <div className="flex items-center gap-2">
              {value !== undefined && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>
                  {value}
                </span>
              )}
              <ArrowRight size={14} color="#94A3B8" />
            </div>
          </Link>
        ))}
      </div>
    </div>
    </>
  )
}