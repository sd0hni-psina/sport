import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { newsApi } from '@/api/news'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Post } from '@/types'

export const Route = createFileRoute('/news/')({
  component: NewsPage,
})

function NewsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: () => newsApi.list().then(r => r.data),
  })

  const posts = data?.data ?? []

  return (
    <div>
      {/* Шапка */}
      <div style={{ background: '#0D1F3C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4"
            style={{ background: '#F5A62320', border: '1px solid #F5A62340', color: '#F5A623' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
            Медиа
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Новости</h1>
          <p className="text-base max-w-xl" style={{ color: '#7A8FA8' }}>
            Последние события, итоги мероприятий и анонсы спортивной жизни Атырау
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="h-72" count={6} />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState icon="📰" title="Новостей пока нет" description="Следите за обновлениями" />
        ) : (
          <>
            {/* Главная новость */}
            {posts[0] && <FeaturedCard post={posts[0]} />}

            {/* Остальные */}
            {posts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                {posts.slice(1).map((post: Post) => (
                  <NewsCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FeaturedCard({ post }: { post: Post }) {
  return (
    <Link
      to="/news/$id"
      params={{ id: String(post.id) }}
      className="group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden mb-2 transition-shadow hover:shadow-lg"
      style={{ border: '1px solid #E2E8F0' }}
    >
      <div
        className="md:w-2/5 h-56 md:h-auto flex items-center justify-center shrink-0"
        style={{ background: post.cover_image ? undefined : '#0D1F3C' }}
      >
        {post.cover_image
          ? <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          : <span className="text-6xl opacity-20">🏆</span>
        }
      </div>
      <div className="p-7 flex flex-col justify-center">
        <div
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-3"
          style={{ color: '#F5A623' }}
        >
          <span className="w-1 h-1 rounded-full" style={{ background: '#F5A623' }} />
          Главное
        </div>
        {post.published_at && (
          <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>
            {format(new Date(post.published_at), 'd MMMM yyyy', { locale: ru })}
          </p>
        )}
        <h2
          className="text-xl font-bold leading-snug mb-3 group-hover:text-blue-600 transition-colors"
          style={{ color: '#0D1F3C' }}
        >
          {post.title}
        </h2>
        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#64748B' }}>
          {post.body.replace(/<[^>]*>/g, '')}
        </p>
        <span className="text-sm font-semibold mt-4 inline-block" style={{ color: '#2563EB' }}>
          Читать полностью →
        </span>
      </div>
    </Link>
  )
}

function NewsCard({ post }: { post: Post }) {
  return (
    <Link
      to="/news/$id"
      params={{ id: String(post.id) }}
      className="group bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-lg flex flex-col"
      style={{ border: '1px solid #E2E8F0' }}
    >
      <div
        className="h-44 flex items-center justify-center"
        style={{ background: post.cover_image ? undefined : '#0D1F3C' }}
      >
        {post.cover_image
          ? <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          : <span className="text-4xl opacity-20">📰</span>
        }
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        {post.published_at && (
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            {format(new Date(post.published_at), 'd MMMM yyyy', { locale: ru })}
          </p>
        )}
        <h3
          className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
          style={{ color: '#0D1F3C' }}
        >
          {post.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-3 mt-auto" style={{ color: '#64748B' }}>
          {post.body.replace(/<[^>]*>/g, '')}
        </p>
      </div>
    </Link>
  )
}