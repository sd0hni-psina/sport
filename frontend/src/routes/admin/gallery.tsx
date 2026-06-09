import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { galleryApi, type GalleryItem } from '@/api/gallery'
import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Image, Video } from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export const Route = createFileRoute('/admin/gallery')({
  component: AdminGalleryPage,
})

function AdminGalleryPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    url: '',
    type: 'photo' as 'photo' | 'video',
    caption: '',
    event_id: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => galleryApi.list().then(r => r.data),
  })

  const addMutation = useMutation({
    mutationFn: () => apiClient.post('/admin/gallery', {
      url:      form.url,
      type:     form.type,
      caption:  form.caption || undefined,
      event_id: form.event_id ? Number(form.event_id) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      setShowForm(false)
      setForm({ url: '', type: 'photo', caption: '', event_id: '' })
      toast.success('Добавлено в галерею')
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Ошибка'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Удалено из галереи')
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Ошибка'),
  })

  const items: GalleryItem[] = data?.data ?? []

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
  const inputStyle = { border: '1px solid #E2E8F0', color: '#0D1F3C' }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Галерея</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{items.length} материалов</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: '#0D1F3C', color: '#fff' }}
        >
          <Plus size={16} />
          Добавить
        </button>
      </div>

      {/* Форма добавления */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #E2E8F0' }}>
          <h2 className="font-bold mb-5" style={{ color: '#0D1F3C' }}>Новый материал</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>
                URL фото или видео *
              </label>
              <input
                value={form.url}
                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                placeholder="https://example.com/photo.jpg"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>
                  Тип
                </label>
                <div className="flex gap-2">
                  {(['photo', 'video'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, type: t }))}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                      style={form.type === t
                        ? { background: '#0D1F3C', color: '#fff' }
                        : { background: '#F1F5F9', color: '#64748B' }
                      }
                    >
                      {t === 'photo' ? <Image size={14} /> : <Video size={14} />}
                      {t === 'photo' ? 'Фото' : 'Видео'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>
                  ID мероприятия (необязательно)
                </label>
                <input
                  type="number"
                  value={form.event_id}
                  onChange={e => setForm(p => ({ ...p, event_id: e.target.value }))}
                  placeholder="1"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>
                Подпись (необязательно)
              </label>
              <input
                value={form.caption}
                onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                placeholder="Описание фото..."
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Предпросмотр */}
            {form.url && form.type === 'photo' && (
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>Предпросмотр</p>
                <img
                  src={form.url}
                  alt="preview"
                  className="h-32 rounded-xl object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}
              >
                Отмена
              </button>
              <button
                onClick={() => addMutation.mutate()}
                disabled={!form.url || addMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#0D1F3C' }}
              >
                {addMutation.isPending ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Skeleton className="aspect-square" count={8} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="🖼️" title="Галерея пуста" description="Добавьте первое фото или видео" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item: GalleryItem) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-xl overflow-hidden"
              style={{ border: '1px solid #E2E8F0' }}
            >
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt={item.caption ?? ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: '#0D1F3C' }}>
                  <Video size={24} color="#F5A623" />
                </div>
              )}

              {/* Оверлей при hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#DC2626' }}
                >
                  <Trash2 size={14} color="white" />
                </button>
              </div>

              {/* Тип */}
              <div
                className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
              >
                {item.type === 'photo' ? '📷' : '🎥'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}