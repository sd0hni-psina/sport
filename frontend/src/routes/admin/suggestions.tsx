import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Skeleton } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'

export const Route = createFileRoute('/admin/suggestions')({
  component: AdminSuggestionsPage,
})

interface Suggestion {
  id: number
  user_id: number
  text: string
  contact: string
  created_at: string
}

function AdminSuggestionsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: () => apiClient.get<{ data: Suggestion[] }>('/admin/suggestions').then(r => r.data),
  })

  const suggestions: Suggestion[] = data?.data ?? []

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Предложения</h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
          Идеи мероприятий от горожан — {suggestions.length} предложений
        </p>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24" count={4} />
        </div>
      ) : suggestions.length === 0 ? (
        <EmptyState icon="💡" title="Предложений пока нет" />
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map((s: Suggestion) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-5"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: '#0D1F3C', color: '#F5A623' }}
                  >
                    #{s.id}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#64748B' }}>
                      Пользователь #{s.user_id}
                    </p>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>
                      {format(new Date(s.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                  </div>
                </div>
                {s.contact && (
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: '#EFF6FF', color: '#2563EB' }}
                  >
                    {s.contact}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#0D1F3C' }}>
                {s.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}