import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import type { Post } from '@/types'
import { useState } from 'react'

export const Route = createFileRoute('/admin/news/')({
  component: AdminNewsPage,
})

function AdminNewsPage() {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news'],
    queryFn: () => apiClient.get<{ data: Post[] }>('/admin/news').then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/news/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] })
      setDeletingId(null)
    },
  })

  const posts: Post[] = data?.data ?? []

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Новости</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{posts.length} публикаций</p>
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

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" style={{ border: '1px solid #E2E8F0' }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl" style={{ border: '1px solid #E2E8F0' }}>
          <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Новостей нет</p>
          <Link to="/admin/news/new" className="text-sm font-medium mt-2 inline-block" style={{ color: '#2563EB' }}>
            Написать первую →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post: Post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl p-5 flex items-center gap-4"
              style={{ border: '1px solid #E2E8F0' }}
            >
              {/* Обложка */}
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
                    <span className="text-green-600 font-medium">
                      Опубликовано · {format(new Date(post.published_at), 'd MMM yyyy', { locale: ru })}
                    </span>
                  ) : (
                    <span className="text-amber-500 font-medium">Черновик</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/news/$id"
                  params={{ id: String(post.id) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#F1F5F9', color: '#64748B' }}
                >
                  <Eye size={14} />
                </Link>
                <Link
                  to="/admin/news/$id/edit"
                  params={{ id: String(post.id) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#EFF6FF', color: '#2563EB' }}
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => setDeletingId(post.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#FEF2F2', color: '#DC2626' }}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
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
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
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