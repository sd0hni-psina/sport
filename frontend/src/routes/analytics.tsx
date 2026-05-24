import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'
import { apiClient } from '@/api/client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import { useState } from 'react'
import { Calendar, Users, Trophy, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { PageMeta } from '@/components/shared/PageMeta'

export const Route = createFileRoute('/analytics')({
  component: AnalyticsPage,
})

const PERIODS = [
  { label: 'Неделя', value: 'week'  },
  { label: 'Месяц',  value: 'month' },
  { label: 'Год',    value: 'year'  },
]

const COLORS = ['#0D1F3C', '#2563EB', '#F5A623', '#059669', '#7C3AED', '#DC2626']

function AnalyticsPage() {
  const [period, setPeriod] = useState('month')

  const { data: counters, isLoading: countersLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => analyticsApi.getCounters().then(r => r.data),
  })

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['stats-full', period],
    queryFn: () => analyticsApi.getFullStats({ period }).then(r => r.data),
  })

  const { data: summaryData } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => apiClient.get<{ data: Record<string, number> }>('/admin/summary').then(r => r.data.data),
  })

  const stats     = statsData?.data
  const bySport   = stats?.by_sport   ?? []
  const byAge     = stats?.by_age     ?? []
  const topEvents = stats?.top_events ?? []

  return (
    <div>
      <PageMeta title="Аналитика" description="Публичная статистика спортивной активности Атырау" />

      {/* Шапка */}
      <div style={{ background: '#0D1F3C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4"
            style={{ background: '#F5A62320', border: '1px solid #F5A62340', color: '#F5A623' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
            Открытые данные
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Аналитика</h1>
          <p className="text-base max-w-xl" style={{ color: '#7A8FA8' }}>
            Публичная статистика спортивной активности города Атырау
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Глобальные счётчики */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {countersLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))
          ) : (
            [
              { label: 'Мероприятий проведено', value: counters?.total_events,       icon: Calendar,   color: '#2563EB' },
              { label: 'Уникальных участников', value: counters?.total_participants,  icon: Users,      color: '#059669' },
              { label: 'Мероприятий всего',     value: summaryData?.total_events,    icon: Trophy,     color: '#F5A623' },
              { label: 'Зарегистрировано',      value: summaryData?.total_users,     icon: TrendingUp, color: '#7C3AED' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>{s.label}</p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + '15' }}>
                    <s.icon size={16} color={s.color} />
                  </div>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#0D1F3C' }}>{s.value ?? '—'}</p>
              </div>
            ))
          )}
        </div>

        {/* Фильтр периода */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold" style={{ color: '#0D1F3C' }}>Детальная статистика</h2>
          <div className="flex gap-2">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={period === p.value
                  ? { background: '#0D1F3C', color: '#fff' }
                  : { background: '#F1F5F9', color: '#64748B' }
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* По видам спорта */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
              <h3 className="font-bold mb-1" style={{ color: '#0D1F3C' }}>По видам спорта</h3>
              <p className="text-xs mb-5" style={{ color: '#94A3B8' }}>Количество участников по дисциплинам</p>
              {bySport.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#94A3B8' }}>
                  Нет данных за период
                </div>
              ) : (
                <div className="w-full" style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bySport}
                      margin={{ top: 0, right: 0, left: -20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis
                        dataKey="sport_type"
                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#94A3B8' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                        formatter={(val) => [val, 'участников']}
                        cursor={{ fill: '#F8FAFC' }}
                      />
                      <Bar dataKey="count" fill="#0D1F3C" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Возрастные группы */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
              <h3 className="font-bold mb-1" style={{ color: '#0D1F3C' }}>Возрастные группы</h3>
              <p className="text-xs mb-5" style={{ color: '#94A3B8' }}>Распределение участников по возрасту</p>
              {byAge.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#94A3B8' }}>
                  Нет данных за период
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-auto" style={{ height: 200, minWidth: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byAge}
                          dataKey="count"
                          nameKey="age_group"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={50}
                          paddingAngle={3}
                        >
                          {byAge.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            fontSize: '12px',
                          }}
                          formatter={(val) => [val, 'участников']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2.5 flex-1">
                    {byAge.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-xs flex-1" style={{ color: '#64748B' }}>{item.age_group}</span>
                        <span className="text-xs font-bold" style={{ color: '#0D1F3C' }}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Топ мероприятий */}
            <div className="bg-white rounded-2xl p-6 lg:col-span-2" style={{ border: '1px solid #E2E8F0' }}>
              <h3 className="font-bold mb-1" style={{ color: '#0D1F3C' }}>Топ мероприятий</h3>
              <p className="text-xs mb-5" style={{ color: '#94A3B8' }}>Самые популярные события по числу участников</p>
              {topEvents.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-sm" style={{ color: '#94A3B8' }}>
                  Нет данных за период
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {topEvents.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: i === 0 ? '#F5A623' : i === 1 ? '#E2E8F0' : '#F8FAFC',
                          color: i === 0 ? '#0D1F3C' : '#64748B',
                        }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate mb-1.5" style={{ color: '#0D1F3C' }}>
                          {item.event_name}
                        </p>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(item.count / topEvents[0].count) * 100}%`,
                              background: i === 0 ? '#F5A623' : '#0D1F3C',
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className="text-sm font-bold shrink-0 min-w-8 text-right"
                        style={{ color: '#0D1F3C' }}
                      >
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}