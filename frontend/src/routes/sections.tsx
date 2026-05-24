import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { MapPin, Phone, Clock, User } from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Section } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'


export const Route = createFileRoute('/sections')({
  component: SectionsPage,
})

function SectionsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sections'],
    queryFn: () => apiClient.get<{ data: Section[] }>('/sections').then(r => r.data),
  })

  const sections = data?.data ?? []

  return (
    <>
    <PageMeta title="Секции" description="Спортивные секции города Атырау" />
    <div>
      {/* Шапка */}
      <div style={{ background: '#0D1F3C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4"
            style={{ background: '#F5A62320', border: '1px solid #F5A62340', color: '#F5A623' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
            Спортивная инфраструктура
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Секции и дисциплины</h1>
          <p className="text-base max-w-xl" style={{ color: '#7A8FA8' }}>
            Спортивные секции города Атырау — собственные и партнёрские. Найди своё направление.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Skeleton className="h-52" count={6} />
          </div>
        ) : sections.length === 0 ? (
          <EmptyState icon="🏋️" title="Секций пока нет" description="Информация о секциях скоро появится" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((section: Section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

function SectionCard({ section }: { section: Section }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
      style={{ border: '1px solid #E2E8F0' }}
    >
      {/* Цветная шапка */}
      <div className="h-2" style={{ background: section.is_partner ? '#F5A623' : '#0D1F3C' }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-snug" style={{ color: '#0D1F3C' }}>
            {section.name}
          </h3>
          {section.is_partner && (
            <span
              className="shrink-0 text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: '#FFF8E7', color: '#D97706' }}
            >
              Партнёр
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#64748B' }}>
          {section.description}
        </p>

        <div className="flex flex-col gap-2 mt-auto pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          {section.trainer_name && (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
              <User size={13} color="#94A3B8" />
              <span>{section.trainer_name}</span>
            </div>
          )}
          {section.address && (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
              <MapPin size={13} color="#94A3B8" />
              <span>{section.address}</span>
            </div>
          )}
          {section.schedule && (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
              <Clock size={13} color="#94A3B8" />
              <span>{section.schedule}</span>
            </div>
          )}
          {section.contact && (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
              <Phone size={13} color="#94A3B8" />
              <span>{section.contact}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}