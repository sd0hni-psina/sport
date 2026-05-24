import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { newsApi } from '@/api/news'
import { apiClient } from '@/api/client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/news/$id/edit')({
  component: AdminNewsEditPage,
})

const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
const inputStyle = { border: '1px solid #E2E8F0', color: '#0D1F3C' }
const labelClass = "block text-xs font-semibold mb-1.5"
const labelStyle = { color: '#64748B' }

function NewsPreview({ form }: {
  form: { title: string; body: string; cover_image: string; published_at: string }
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
      <div
        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
        style={{ background: '#FFF8E7', borderBottom: '1px solid #FDE68A', color: '#D97706' }}
      >
        <Eye size={13} />
        Предпросмотр — так будет выглядеть новость на сайте
      </div>

      {form.cover_image ? (
        <img
          src={form.cover_image}
          alt={form.title}
          className="w-full h-64 object-cover"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="w-full h-40 flex items-center justify-center" style={{ background: '#0D1F3C' }}>
          <span className="text-4xl opacity-20">📰</span>
        </div>
      )}

      <div className="p-6">
        <p className="text-xs mb-3" style={{ color: '#94A3B8' }}>
          {format(new Date(), 'd MMMM yyyy', { locale: ru })}
        </p>
        <h1 className="text-2xl font-bold mb-5 leading-snug" style={{ color: '#0D1F3C' }}>
          {form.title || <span style={{ color: '#CBD5E1' }}>Заголовок не заполнен</span>}
        </h1>
        <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#475569' }}>
          {form.body || <span style={{ color: '#CBD5E1' }}>Текст не заполнен</span>}
        </div>
      </div>
    </div>
  )
}

function AdminNewsEditPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [publishNow, setPublishNow] = useState(true)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  const [form, setForm] = useState({
    title: '',
    body: '',
    cover_image: '',
    published_at: '',
  })

  const { data: post, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.getById(Number(id)).then(r => r.data.data),
  })

  useEffect(() => {
    if (!post) return
    setForm({
      title:        post.title,
      body:         post.body,
      cover_image:  post.cover_image ?? '',
      published_at: post.published_at
        ? format(new Date(post.published_at), "yyyy-MM-dd'T'HH:mm")
        : '',
    })
    setPublishNow(!!post.published_at)
  }, [post])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Record<string, any> = {
        title: form.title,
        body:  form.body,
      }
      if (form.cover_image) payload.cover_image = form.cover_image
      if (publishNow) {
        payload.published_at = post?.published_at ?? new Date().toISOString()
      } else if (form.published_at) {
        payload.published_at = new Date(form.published_at).toISOString()
      }

      await apiClient.put(`/admin/news/${id}`, payload)
      toast.success('Новость сохранена')
      navigate({ to: '/admin/news' })
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-64 bg-white rounded-2xl animate-pulse" style={{ border: '1px solid #E2E8F0' }} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/news"
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: '#F1F5F9', color: '#64748B' }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Редактировать новость</h1>
          <p className="text-sm mt-0.5 truncate max-w-md" style={{ color: '#94A3B8' }}>{post?.title}</p>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('edit')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={tab === 'edit'
            ? { background: '#0D1F3C', color: '#fff' }
            : { background: '#F1F5F9', color: '#64748B' }
          }
        >
          <Pencil size={14} />
          Редактор
        </button>
        <button
          onClick={() => setTab('preview')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={tab === 'preview'
            ? { background: '#0D1F3C', color: '#fff' }
            : { background: '#F1F5F9', color: '#64748B' }
          }
        >
          <Eye size={14} />
          Предпросмотр
        </button>
      </div>

      {/* Контент */}
      {tab === 'preview' ? (
        <NewsPreview form={form} />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
            <h2 className="text-sm font-bold mb-5" style={{ color: '#0D1F3C' }}>Содержание</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Заголовок *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Текст *</label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleChange}
                  required
                  rows={12}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Ссылка на обложку</label>
                <input
                  name="cover_image"
                  value={form.cover_image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
            <h2 className="text-sm font-bold mb-5" style={{ color: '#0D1F3C' }}>Публикация</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPublishNow(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={publishNow
                    ? { background: '#0D1F3C', color: '#fff' }
                    : { background: '#F1F5F9', color: '#64748B' }
                  }
                >
                  Опубликовано
                </button>
                <button
                  type="button"
                  onClick={() => setPublishNow(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={!publishNow
                    ? { background: '#0D1F3C', color: '#fff' }
                    : { background: '#F1F5F9', color: '#64748B' }
                  }
                >
                  Черновик
                </button>
              </div>
              {!publishNow && (
                <div>
                  <label className={labelClass} style={labelStyle}>Дата публикации</label>
                  <input
                    type="datetime-local"
                    name="published_at"
                    value={form.published_at}
                    onChange={handleChange}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pb-6">
            <Link
              to="/admin/news"
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-center border"
              style={{ borderColor: '#E2E8F0', color: '#64748B' }}
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: '#0D1F3C' }}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}