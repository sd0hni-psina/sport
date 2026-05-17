import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { newsApi } from '@/api/news'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Post } from '@/types'

export const Route = createFileRoute('/news/')({
  component: NewsPage,
})

function NewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => newsApi.list().then(r => r.data),
  })

  const posts = data?.data ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Новости</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Новостей пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post: Post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

function NewsCard({ post }: { post: Post }) {
  return (
    <Link
      to="/news/$id"
      params={{ id: String(post.id) }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group"
    >
      {post.cover_image ? (
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <span className="text-white text-4xl font-bold opacity-20">А</span>
        </div>
      )}
      <div className="p-5 flex flex-col gap-2 flex-1">
        {post.published_at && (
          <p className="text-xs text-gray-400">
            {format(new Date(post.published_at), 'd MMMM yyyy', { locale: ru })}
          </p>
        )}
        <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 flex-1">
          {post.body.replace(/<[^>]*>/g, '')}
        </p>
        <span className="text-sm text-blue-600 font-medium mt-2">Читать →</span>
      </div>
    </Link>
  )
}