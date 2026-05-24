import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/api/events'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MapPin, Clock, Users, Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Event } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'


export const Route = createFileRoute('/events/')({
  component: EventsPage,
})

const SPORT_TYPES = [
  'Все', 'Бег', 'Футбол', 'Баскетбол', 'Волейбол',
  'Плавание', 'Велоспорт', 'Теннис', 'Бокс', 'Йога',
]

const PAGE_SIZE = 12

function EventsPage() {
  const [sport, setSport] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [date, setDate] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['events', sport, date, page],
  queryFn: () => eventsApi.list({
    sport: sport || undefined,
    date:  date  || undefined,
    page,
    page_size: PAGE_SIZE,
  }).then(r => r.data),
})

  const events = data?.data ?? []
  const pagination = data?.pagination

  // клиентский поиск по названию
  const filtered = events.filter((e: Event) =>
    search === '' || e.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSportChange(type: string) {
    setSport(type === 'Все' ? '' : type)
    setPage(1)
  }

  return (
    <>
    <PageMeta title="Мероприятия" description="Городские спортивные мероприятия Атырау" />
    <div>
      {/* Шапка */}
      <div style={{ background: '#0D1F3C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4"
            style={{ background: '#F5A62320', border: '1px solid #F5A62340', color: '#F5A623' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
            Спортивная жизнь Атырау
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Мероприятия</h1>
          <p className="text-base max-w-xl" style={{ color: '#7A8FA8' }}>
            Городские спортивные события — найди своё и запишись онлайн
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Фильтры */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
            />
          </div>

          {/* Фильтр по дате */}
<div className="flex items-center gap-3">
  <div className="relative">
    <input
      type="date"
      value={date}
      onChange={e => { setDate(e.target.value); setPage(1) }}
      className="px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      style={{ border: '1px solid #E2E8F0', color: date ? '#0D1F3C' : '#94A3B8' }}
    />
  </div>
  {date && (
    <button
      onClick={() => { setDate(''); setPage(1) }}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors"
      style={{ background: '#FEF2F2', color: '#DC2626' }}
    >
      <X size={12} />
      Сбросить дату
    </button>
  )}
</div>

          <div className="flex gap-2 flex-wrap">
            {SPORT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => handleSportChange(type)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={
                  (type === 'Все' && sport === '') || sport === type
                    ? { background: '#0D1F3C', color: '#ffffff' }
                    : { background: '#F1F5F9', color: '#64748B' }
                }
              >
                {type}
              </button>
            ))}
          </div>

          {pagination && (
            <p className="text-xs" style={{ color: '#94A3B8' }}>
              Найдено: {pagination.total} мероприятий
            </p>
          )}
        </div>

        {/* Список */}
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Skeleton className="h-64" count={PAGE_SIZE} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🏅"
            title="Мероприятий не найдено"
            description="Попробуйте изменить фильтры"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            {(sport || date || search) && (
  <button
    onClick={() => { setSport(''); setDate(''); setSearch(''); setPage(1) }}
    className="text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
    style={{ background: '#F1F5F9', color: '#64748B' }}
  >
    Сбросить все фильтры
  </button>
)}

            {/* Пагинация */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{ background: '#F1F5F9', color: '#64748B' }}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.total_pages || Math.abs(p - page) <= 2)
                  .reduce<(number | 'dots')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('dots')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === 'dots' ? (
                      <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: '#94A3B8' }}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className="w-9 h-9 rounded-xl text-sm font-semibold transition-colors"
                        style={
                          page === p
                            ? { background: '#0D1F3C', color: '#ffffff' }
                            : { background: '#F1F5F9', color: '#64748B' }
                        }
                      >
                        {p}
                      </button>
                    )
                  )
                }

                <button
                  onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                  disabled={page === pagination.total_pages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{ background: '#F1F5F9', color: '#64748B' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  )
}

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      to="/events/$id"
      params={{ id: String(event.id) }}
      className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-lg"
      style={{ border: '1px solid #E2E8F0' }}
    >
      <div
        className="h-24 flex items-center justify-center relative shrink-0"
        style={{ background: '#0D1F3C' }}
      >
        <span className="text-4xl">
          {event.sport_type === 'Бег' ? '🏃' :
           event.sport_type === 'Футбол' ? '⚽' :
           event.sport_type === 'Плавание' ? '🏊' :
           event.sport_type === 'Волейбол' ? '🏐' :
           event.sport_type === 'Баскетбол' ? '🏀' :
           event.sport_type === 'Бокс' ? '🥊' :
           event.sport_type === 'Велоспорт' ? '🚴' :
           event.sport_type === 'Теннис' ? '🎾' :
           event.sport_type === 'Йога' ? '🧘' : '🏅'}
        </span>
        <div
          className="absolute top-2.5 left-2.5 text-xs font-bold px-2 py-1 rounded-lg"
          style={{ background: '#F5A623', color: '#0D1F3C' }}
        >
          {format(new Date(event.time_start), 'd MMM', { locale: ru })}
        </div>
        <div
          className="absolute top-2.5 right-2.5 text-xs font-medium px-2 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
        >
          {event.sport_type}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <h3
          className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
          style={{ color: '#0D1F3C' }}
        >
          {event.name}
        </h3>

        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
            <Clock size={12} />
            <span>{format(new Date(event.time_start), 'HH:mm · d MMMM', { locale: ru })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
            <MapPin size={12} />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          {event.max_participants && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
              <Users size={12} />
              <span>До {event.max_participants} участников</span>
            </div>
          )}
        </div>

        <div
          className="mt-1 w-full py-2 rounded-lg text-xs font-semibold text-center text-white"
          style={{ background: '#0D1F3C' }}
        >
          Подробнее
        </div>
      </div>
    </Link>
  )
}