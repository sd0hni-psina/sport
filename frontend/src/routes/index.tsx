import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'
import { eventsApi } from '@/api/events'
import { newsApi } from '@/api/news'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, Users, ChevronRight, MapPin, Clock } from 'lucide-react'
import type { Event, Post } from '@/types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { data: counters } = useQuery({
    queryKey: ['stats'],
    queryFn: () => analyticsApi.getCounters().then(r => r.data),
  })

  const { data: eventsData } = useQuery({
    queryKey: ['events', 'home'],
    queryFn: () => eventsApi.list({ page: 1 }).then(r => r.data),
  })

  const { data: newsData } = useQuery({
    queryKey: ['news', 'home'],
    queryFn: () => newsApi.list().then(r => r.data),
  })

  const events = eventsData?.data?.slice(0, 4) ?? []
  const posts = newsData?.data?.slice(0, 3) ?? []

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Массовый спорт Атырау
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Участвуй в городских спортивных мероприятиях, записывайся на секции и следи за новостями
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/events"
              className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Все мероприятия
            </Link>
            <Link
              to="/auth/register"
              className="px-6 py-3 bg-blue-600 border border-white/30 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </section>

      {/* Счётчики */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="text-blue-600" size={22} />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {counters?.total_events ?? '—'}
            </span>
            <span className="text-sm text-gray-500">мероприятий проведено</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="text-green-600" size={22} />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {counters?.total_participants ?? '—'}
            </span>
            <span className="text-sm text-gray-500">участников за всё время</span>
          </div>
        </div>
      </section>

      {/* Ближайшие мероприятия */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ближайшие мероприятия</h2>
          <Link
            to="/events"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Все <ChevronRight size={16} />
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">Нет предстоящих мероприятий</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Новости */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Новости</h2>
            <Link
              to="/news"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Все <ChevronRight size={16} />
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="text-gray-500 text-sm">Нет новостей</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post: Post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      to="/events/$id"
      params={{ id: String(event.id) }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-24 flex items-center justify-center">
        <span className="text-white font-bold text-lg">{event.sport_type}</span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{event.name}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} />
          <span>
            {format(new Date(event.time_start), 'd MMM, HH:mm', { locale: ru })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </div>
    </Link>
  )
}

function NewsCard({ post }: { post: Post }) {
  return (
    <Link
      to="/news/$id"
      params={{ id: String(post.id) }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">
          {post.published_at
            ? format(new Date(post.published_at), 'd MMMM yyyy', { locale: ru })
            : ''}
        </p>
        <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
      </div>
    </Link>
  )
}