import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { newsApi } from '@/api/news'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'

export const Route = createFileRoute('/news/$id')({
  component: NewsDetailPage,
})

function NewsDetailPage() {
  const { id } = Route.useParams()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.getById(Number(id)).then(r => r.data.data),
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Skeleton className="h-64 mb-6" />
        <Skeleton className="h-8 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <ErrorState message="Не удалось загрузить новость" onRetry={refetch} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        to="/news"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
        style={{ color: '#94A3B8' }}
      >
        <ArrowLeft size={15} /> Все новости
      </Link>

      {data.cover_image && (
        <img
          src={data.cover_image}
          alt={data.title}
          className="w-full h-64 object-cover rounded-2xl mb-6"
        />
      )}

      {data.published_at && (
        <div className="flex items-center gap-2 mb-3" style={{ color: '#94A3B8' }}>
          <Calendar size={14} />
          <span className="text-sm">
            {format(new Date(data.published_at), 'd MMMM yyyy', { locale: ru })}
          </span>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 leading-snug" style={{ color: '#0D1F3C' }}>
        {data.title}
      </h1>

      <div
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: '#475569' }}
      >
        {data.body}
      </div>

      <div className="mt-10 pt-6" style={{ borderTop: '1px solid #E2E8F0' }}>
        <Link
          to="/news"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: '#2563EB' }}
        >
          <ArrowLeft size={14} /> Вернуться к новостям
        </Link>
      </div>
    </div>
  )
}