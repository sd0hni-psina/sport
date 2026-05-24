import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Post } from '@/types'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/news/')({
  component: AdminNewsPage,
})

type FilterType = 'all' | 'published' | 'draft'

function AdminNewsPage() {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-news'],
    queryFn: () => apiClient.get<{ data: Post[] }>('/admin/news').then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/news/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] })
      queryClient.invalidateQueries({ queryKey: ['admin-summary'] })
      setDeletingId(null)
      toast.success('Новость удалена')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? 'Ошибка при удалении')
    },
  })

  const allPosts: Post[] = data?.data ?? []

  const filteredByType = filter === 'published'
    ? allPosts.filter(p => !!p.published_at)
    : filter === 'draft'
    ? allPosts.filter(p => !p.published_at)
    : allPosts

  const posts = search
    ? filteredByType.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    : filteredByType

  const publishedCount = allPosts.filter(p => !!p.published_at).length
  const draftCount = allPosts.filter(p => !p.published_at).length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Новости</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{allPosts.length} публикаций</p>
        </div>
        <Link
          to="/admin/news/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: '#0D1F3C', color: '#fff' }}
        >
          <Plus size={16} />
          Написать
        </Link>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {([
          { key: 'all',       label: `Все (${allPosts.length})`         },
          { key: 'published', label: `Опубликовано (${publishedCount})` },
          { key: 'draft',     label: `Черновики (${draftCount})`        },
        ] as { key: FilterType; label: string }[]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={filter === f.key
              ? { background: '#0D1F3C', color: '#fff' }
              : { background: '#F1F5F9', color: '#64748B' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Поиск */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
        <input
          type="text"
          placeholder="Поиск по заголовку..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
        />
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" count={3} />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="📰"
          title={search ? 'Ничего не найдено' : 'Новостей нет'}
          description={search ? 'Попробуйте изменить запрос' : undefined}
          action={
            !search && filter === 'all' ? (
              <Link
                to="/admin/news/new"
                className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
                style={{ background: '#0D1F3C' }}
              >
                Написать первую
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post: Post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl p-5 flex items-center gap-4"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <div
                className="w-14 h-14 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                style={{ background: '#0D1F3C' }}
              >
                {post.cover_image
                  ? <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xl opacity-40">📰</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate mb-1" style={{ color: '#0D1F3C' }}>
                  {post.title}
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                  {post.published_at ? (
                    <span className="font-medium" style={{ color: '#059669' }}>
                      Опубликовано · {format(new Date(post.published_at), 'd MMM yyyy', { locale: ru })}
                    </span>
                  ) : (
                    <span className="font-medium" style={{ color: '#D97706' }}>Черновик</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/news/$id"
                  params={{ id: String(post.id) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#F1F5F9', color: '#64748B' }}
                  title="Просмотр"
                >
                  <Eye size={14} />
                </Link>
                <Link
                  to="/admin/news/$id/edit"
                  params={{ id: String(post.id) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#EFF6FF', color: '#2563EB' }}
                  title="Редактировать"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => setDeletingId(post.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#FEF2F2', color: '#DC2626' }}
                  title="Удалить"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-2" style={{ color: '#0D1F3C' }}>Удалить новость?</h3>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>Это действие нельзя отменить.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}
              >
                Отмена
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#DC2626' }}
              >
                {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}