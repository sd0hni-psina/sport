import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { newsApi } from '@/api/news'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, Calendar } from 'lucide-react'

export const Route = createFileRoute('/news/$id')({
  component: NewsDetailPage,
})

function NewsDetailPage() {
  const { id } = Route.useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.getById(Number(id)).then(r => r.data.data),
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse mb-6" />
        <div className="h-8 bg-gray-100 rounded animate-pulse mb-3" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        Новость не найдена
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        to="/news"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Все новости
      </Link>

      {data.cover_image && (
        <img
          src={data.cover_image}
          alt={data.title}
          className="w-full h-64 object-cover rounded-2xl mb-6"
        />
      )}

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <Calendar size={14} />
        {data.published_at && (
          <span>{format(new Date(data.published_at), 'd MMMM yyyy', { locale: ru })}</span>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">{data.title}</h1>

      <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
        {data.body}
      </div>
    </div>
  )
}