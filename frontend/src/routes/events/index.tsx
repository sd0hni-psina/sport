import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/api/events'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MapPin, Clock, Users, Search } from 'lucide-react'
import { useState } from 'react'
import type { Event } from '@/types'

export const Route = createFileRoute('/events/')({
  component: EventsPage,
})

const SPORT_TYPES = [
  'Все', 'Бег', 'Футбол', 'Баскетбол', 'Волейбол',
  'Плавание', 'Велоспорт', 'Теннис', 'Бокс', 'Йога',
]

function EventsPage() {
  const [sport, setSport] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['events', sport],
    queryFn: () => eventsApi.list({ sport: sport || undefined }).then(r => r.data),
  })

  const events = data?.data ?? []

  const filtered = events.filter((e: Event) =>
    search === '' || e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Мероприятия</h1>

      {/* Фильтры */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Поиск */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Виды спорта */}
        <div className="flex gap-2 flex-wrap">
          {SPORT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSport(type === 'Все' ? '' : type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                (type === 'Все' && sport === '') || sport === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Список */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Мероприятий не найдено</p>
          <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event: Event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const spotsLeft = event.max_participants

  return (
    <Link
      to="/events/$id"
      params={{ id: String(event.id) }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group"
    >
      {/* Шапка карточки */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 px-5 py-6 relative">
        <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-2">
          {event.sport_type}
        </span>
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 group-hover:underline">
          {event.name}
        </h3>
      </div>

      {/* Детали */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={14} className="shrink-0" />
          <span>
            {format(new Date(event.time_start), 'd MMMM, HH:mm', { locale: ru })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={14} className="shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {spotsLeft !== null && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={14} className="shrink-0" />
            <span>Мест: {spotsLeft}</span>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100">
          {event.min_age || event.max_age ? (
            <span className="text-xs text-gray-400">
              Возраст: {event.min_age ?? '0'}–{event.max_age ?? '∞'} лет
            </span>
          ) : (
            <span className="text-xs text-gray-400">Для всех возрастов</span>
          )}
        </div>
      </div>
    </Link>
  )
}