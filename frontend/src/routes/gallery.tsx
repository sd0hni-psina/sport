import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { galleryApi, type GalleryItem } from '@/api/gallery'
import { useState } from 'react'
import { X, Play, ZoomIn } from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageMeta } from '@/components/shared/PageMeta'

export const Route = createFileRoute('/gallery')({
  component: GalleryPage,
})

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i)

function GalleryPage() {
  const [year, setYear] = useState<number | undefined>(undefined)
  const [typeFilter, setTypeFilter] = useState<'all' | 'photo' | 'video'>('all')
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['gallery', year],
    queryFn: () => galleryApi.list({ year }).then(r => r.data),
  })

  const items = (data?.data ?? []).filter(item =>
    typeFilter === 'all' ? true : item.type === typeFilter
  )

  const photoCount = (data?.data ?? []).filter(i => i.type === 'photo').length
  const videoCount = (data?.data ?? []).filter(i => i.type === 'video').length

  return (
    <div>
      <PageMeta title="Галерея" description="Фото и видео архив спортивных мероприятий Атырау" />

      {/* Шапка */}
      <div style={{ background: '#0D1F3C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4"
            style={{ background: '#F5A62320', border: '1px solid #F5A62340', color: '#F5A623' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
            Медиаархив
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Галерея</h1>
          <p className="text-base max-w-xl" style={{ color: '#7A8FA8' }}>
            Фото и видео с городских спортивных мероприятий Атырау
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Тип */}
          <div className="flex gap-2">
            {[
              { key: 'all',   label: `Все (${(data?.data ?? []).length})`  },
              { key: 'photo', label: `Фото (${photoCount})`                },
              { key: 'video', label: `Видео (${videoCount})`               },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key as any)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={typeFilter === f.key
                  ? { background: '#0D1F3C', color: '#fff' }
                  : { background: '#F1F5F9', color: '#64748B' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Год */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setYear(undefined)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={year === undefined
                ? { background: '#F5A623', color: '#0D1F3C' }
                : { background: '#F1F5F9', color: '#64748B' }
              }
            >
              Все годы
            </button>
            {YEARS.map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={year === y
                  ? { background: '#F5A623', color: '#0D1F3C' }
                  : { background: '#F1F5F9', color: '#64748B' }
                }
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Сетка */}
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <Skeleton className="aspect-square" count={12} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="🖼️"
            title="Пока ничего нет"
            description="Фото и видео с мероприятий скоро появятся"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item: GalleryItem) => (
              <button
                key={item.id}
                onClick={() => setLightbox(item)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 hover:opacity-95 transition-opacity"
                style={{ border: '1px solid #E2E8F0' }}
              >
                {item.type === 'photo' ? (
                  <>
                    <img
                      src={item.url}
                      alt={item.caption ?? ''}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn
                        size={24}
                        color="white"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: '#0D1F3C' }}
                    >
                      <Play size={32} color="#F5A623" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2" style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <p className="text-white text-xs truncate">{item.caption ?? 'Видео'}</p>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>

          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full">
            {lightbox.type === 'photo' ? (
              <img
                src={lightbox.url}
                alt={lightbox.caption ?? ''}
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
            ) : (
              <video
                src={lightbox.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-xl"
              />
            )}
            {lightbox.caption && (
              <p className="text-white text-sm text-center mt-3 opacity-70">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}