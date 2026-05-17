import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { MapPin, Phone, Clock, User } from 'lucide-react'
import type { Section } from '@/types'

export const Route = createFileRoute('/sections')({
  component: SectionsPage,
})

function SectionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: () => apiClient.get<{ data: Section[] }>('/sections').then(r => r.data),
  })

  const sections = data?.data ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Секции</h1>
      <p className="text-gray-500 mb-8">Спортивные секции и дисциплины города Атырау</p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Секций пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section: Section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionCard({ section }: { section: Section }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900 text-lg">{section.name}</h3>
        {section.is_partner && (
          <span className="shrink-0 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
            Партнёр
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 line-clamp-3">{section.description}</p>

      <div className="flex flex-col gap-2 text-sm text-gray-500 border-t border-gray-100 pt-4">
        {section.trainer_name && (
          <div className="flex items-center gap-2">
            <User size={14} className="shrink-0 text-gray-400" />
            <span>{section.trainer_name}</span>
          </div>
        )}
        {section.address && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-gray-400" />
            <span>{section.address}</span>
          </div>
        )}
        {section.schedule && (
          <div className="flex items-center gap-2">
            <Clock size={14} className="shrink-0 text-gray-400" />
            <span>{section.schedule}</span>
          </div>
        )}
        {section.contact && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="shrink-0 text-gray-400" />
            <span>{section.contact}</span>
          </div>
        )}
      </div>
    </div>
  )
}