import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics'
import { eventsApi } from '@/api/events'
import { newsApi } from '@/api/news'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MapPin, Clock, Calendar, Users, Medal } from 'lucide-react'
import type { Event, Post } from '@/types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

// const TICKER_ITEMS = [
//   'Чемпионат по мини-футболу — 20 мая',
//   'Запись в секцию плавания открыта',
//   'День молодёжи — спортивный праздник 25 июня',
//   'Районный забег «Атырау бежит» — 1 июня',
// ]

function HomePage() {
  const { data: counters } = useQuery({
    queryKey: ['stats'],
    queryFn: () => analyticsApi.getCounters().then(r => r.data),
  })

  const { data: tickerData } = useQuery({
  queryKey: ['events', 'ticker'],
  queryFn: () => eventsApi.list({ page: 1 }).then(r => r.data),
  })

  const { data: eventsData } = useQuery({
    queryKey: ['events', 'home'],
    queryFn: () => eventsApi.list({ page: 1 }).then(r => r.data),
  })

  const { data: newsData } = useQuery({
    queryKey: ['news', 'home'],
    queryFn: () => newsApi.list().then(r => r.data),
  })

  const events = eventsData?.data?.slice(0, 3) ?? []
  const posts  = newsData?.data?.slice(0, 3) ?? []
  const tickerItems = tickerData?.data?.map((e: Event) =>
  `${e.name} — ${format(new Date(e.time_start), 'd MMMM', { locale: ru })}`
) ?? []

  return (
    <div>
      {/* Тикер */}
      {tickerItems.length > 0 && (
  <div className="overflow-hidden py-2.5" style={{ background: '#F5A623' }}>
    <div
      style={{
        display: 'inline-flex',
        animation: 'ticker 30s linear infinite',
        whiteSpace: 'nowrap',
      }}
    >
      {[...tickerItems, ...tickerItems].map((item, i) => (
        <span
          key={i}
          className="px-10 text-xs font-bold uppercase tracking-wide"
          style={{ color: '#0D1F3C' }}
        >
          ⚡ {item}
        </span>
      ))}
    </div>
    <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
  </div>
      )}

      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Бейдж */}
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-6"
              style={{ background: '#FFF8E7', border: '1px solid #F5A62340', color: '#D97706' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
              Официальная платформа Акимата города Атырау
            </div>

            <h1 className="text-5xl font-bold leading-tight mb-4" style={{ color: '#0D1F3C', letterSpacing: '-0.5px' }}>
              Массовый спорт<br />
              <span style={{ color: '#2563EB' }}>Атырау</span>
            </h1>

            <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: '#64748B' }}>
              Участвуй в городских спортивных мероприятиях, записывайся на секции и следи за новостями спортивной жизни города
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/events"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: '#0D1F3C', color: '#ffffff' }}
              >
                Все мероприятия
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-colors border"
                style={{ background: '#ffffff', color: '#0D1F3C', borderColor: '#E2E8F0' }}
              >
                Зарегистрироваться
              </Link>
            </div>
          </div>

          {/* Статы справа */}
          <div className="flex flex-col gap-4">
            {[
              { icon: <Calendar size={20} />, num: counters?.total_events ?? '—', label: 'мероприятий проведено' },
              { icon: <Users size={20} />,    num: counters?.total_participants ?? '—', label: 'участников за всё время' },
              { icon: <Medal size={20} />,    num: '18', label: 'активных секций' },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#0D1F3C', color: '#F5A623' }}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>{s.num}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Мероприятия */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#F5A623' }}>
              Ближайшие события
            </p>
            <h2 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Афиша мероприятий</h2>
          </div>
          <Link to="/events" className="text-sm font-medium" style={{ color: '#2563EB' }}>
            Все мероприятия →
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-slate-400">Нет предстоящих мероприятий</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e: Event) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {/* Новости */}
      <section className="border-t" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#F5A623' }}>
                Медиа
              </p>
              <h2 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Последние новости</h2>
            </div>
            <Link to="/news" className="text-sm font-medium" style={{ color: '#2563EB' }}>
              Все новости →
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="text-sm text-slate-400">Нет новостей</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {posts.map((p: Post) => <NewsCard key={p.id} post={p} />)}
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
      className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
      style={{ border: '1px solid #E2E8F0' }}
    >
      {/* Шапка */}
      <div
        className="h-20 flex items-center justify-center relative"
        style={{ background: '#0D1F3C' }}
      >
        <span className="text-3xl">
          {event.sport_type === 'Бег' ? '🏃' :
           event.sport_type === 'Футбол' ? '⚽' :
           event.sport_type === 'Плавание' ? '🏊' :
           event.sport_type === 'Волейбол' ? '🏐' :
           event.sport_type === 'Баскетбол' ? '🏀' : '🏅'}
        </span>
        <div
          className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded"
          style={{ background: '#F5A623', color: '#0D1F3C' }}
        >
          {format(new Date(event.time_start), 'd MMM', { locale: ru })}
        </div>
        <div
          className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
        >
          Открыта запись
        </div>
      </div>

      {/* Тело */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-sm leading-snug" style={{ color: '#0D1F3C' }}>
          {event.name}
        </h3>
        <div className="flex flex-col gap-1 mt-auto">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
            <MapPin size={11} />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
            <Clock size={11} />
            {format(new Date(event.time_start), 'HH:mm', { locale: ru })}
          </div>
        </div>
        <div
          className="mt-2 w-full py-2 rounded-lg text-xs font-semibold text-center transition-colors"
          style={{ background: '#0D1F3C', color: '#fff' }}
        >
          Записаться
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
      className="group bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-lg"
      style={{ border: '1px solid #E2E8F0' }}
    >
      {post.cover_image ? (
        <img src={post.cover_image} alt={post.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 flex items-center justify-center" style={{ background: '#0D1F3C' }}>
          <span className="text-4xl opacity-40">🏆</span>
        </div>
      )}
      <div className="p-4">
        {post.published_at && (
          <p className="text-xs mb-1.5" style={{ color: '#94A3B8' }}>
            {format(new Date(post.published_at), 'd MMMM yyyy', { locale: ru })}
          </p>
        )}
        <h3 className="font-semibold text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2" style={{ color: '#0D1F3C' }}>
          {post.title}
        </h3>
      </div>
    </Link>
  )
}