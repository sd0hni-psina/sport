import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { sectionsApi } from '@/api/sections'
import { MapPin, Phone, Clock, User, ArrowLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { PageMeta } from '@/components/shared/PageMeta'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export const Route = createFileRoute('/sections/$id')({
  component: SectionDetailPage,
})

function SectionDetailPage() {
  const { id } = Route.useParams()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['section', id],
    queryFn: () => sectionsApi.getById(Number(id)).then(r => r.data.data),
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Skeleton className="h-48 mb-6" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <ErrorState message="Не удалось загрузить секцию" onRetry={refetch} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <PageMeta title={data.name} description={data.description} />

      <Breadcrumbs items={[
        { label: 'Главная', to: '/' },
        { label: 'Секции',  to: '/sections' },
        { label: data.name },
      ]} />

      {/* Шапка */}
      <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: '#0D1F3C' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {data.is_partner && (
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
                style={{ background: '#F5A623', color: '#0D1F3C' }}
              >
                Партнёрская секция
              </span>
            )}
            <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Основной контент */}
        <div className="md:col-span-2 flex flex-col gap-5">

          {/* Описание */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
            <h2 className="font-bold mb-3" style={{ color: '#0D1F3C' }}>О секции</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#64748B' }}>
              {data.description}
            </p>
          </div>

          {/* Тренер */}
          {data.trainer_name && (
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
              <h2 className="font-bold mb-3" style={{ color: '#0D1F3C' }}>Тренер</h2>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#0D1F3C' }}
                >
                  <User size={20} color="#F5A623" />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: '#0D1F3C' }}>{data.trainer_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Расписание */}
          {data.schedule && (
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
              <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#0D1F3C' }}>
                <Clock size={16} color="#94A3B8" />
                Расписание
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#64748B' }}>
                {data.schedule}
              </p>
            </div>
          )}
        </div>

        {/* Сайдбар */}
        <div className="flex flex-col gap-4">

          {/* Контакты */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E2E8F0' }}>
            <h2 className="font-bold mb-4" style={{ color: '#0D1F3C' }}>Контакты</h2>
            <div className="flex flex-col gap-3">
              {data.address && (
                <div className="flex items-start gap-2.5 text-sm" style={{ color: '#64748B' }}>
                  <MapPin size={15} className="shrink-0 mt-0.5" color="#94A3B8" />
                  <span>{data.address}</span>
                </div>
              )}
              {data.contact && (
                <div className="flex items-center gap-2.5 text-sm" style={{ color: '#64748B' }}>
                  <Phone size={15} className="shrink-0" color="#94A3B8" />
                  <span>{data.contact}</span>
                </div>
              )}
              {!data.address && !data.contact && (
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  Контактная информация не указана
                </p>
              )}
            </div>
          </div>

          {/* Ссылка на мероприятия */}
          <Link
            to="/events"
            search={{ sport: data.name }}
            className="flex items-center justify-between p-4 rounded-xl transition-shadow hover:shadow-md"
            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: '#0D1F3C' }}>
                Мероприятия по этой дисциплине
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                Найти события
              </p>
            </div>
            <ChevronRight size={16} color="#94A3B8" />
          </Link>
        </div>
      </div>
    </div>
  )
}