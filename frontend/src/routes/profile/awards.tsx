import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { awardsApi } from '@/api/awards'
import { authStore } from '@/store/auth'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, Trophy } from 'lucide-react'
import { Skeleton } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageMeta } from '@/components/shared/PageMeta'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import type { Award } from '@/types'

export const Route = createFileRoute('/profile/awards')({
  beforeLoad: ({ location }) => {
    if (!authStore.isAuthenticated()) {
      throw redirect({ to: '/auth/login', state: { from: location.href } })
    }
  },
  component: AwardsPage,
})

const AWARD_CONFIG = {
  medal:       { emoji: '🥇', label: 'Медаль',      bg: '#FFF8E7', color: '#D97706' },
  diploma:     { emoji: '📜', label: 'Диплом',      bg: '#EFF6FF', color: '#2563EB' },
  certificate: { emoji: '🏆', label: 'Сертификат',  bg: '#ECFDF5', color: '#059669' },
}

function AwardsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-awards'],
    queryFn: () => awardsApi.myAwards().then(r => r.data),
  })

  const awards: Award[] = data?.data ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <PageMeta title="Мои награды" />

      <Breadcrumbs items={[
        { label: 'Главная', to: '/'        },
        { label: 'Профиль', to: '/profile' },
        { label: 'Награды'                 },
      ]} />

      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/profile"
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: '#F1F5F9', color: '#64748B' }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Мои награды</h1>
          <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
            {awards.length} наград получено
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-32" count={4} />
        </div>
      ) : awards.length === 0 ? (
        <EmptyState
          icon="🏅"
          title="Наград пока нет"
          description="Участвуй в мероприятиях чтобы получать награды"
          action={
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#0D1F3C' }}
            >
              Найти мероприятие
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {awards.map((award: Award) => {
            const config = AWARD_CONFIG[award.type] ?? AWARD_CONFIG.certificate
            return (
              <div
                key={award.id}
                className="rounded-2xl p-5 flex items-start gap-4"
                style={{ background: config.bg, border: `1px solid ${config.color}30` }}
              >
                <span className="text-4xl shrink-0">{config.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: config.color + '20', color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="font-semibold text-sm leading-snug" style={{ color: '#0D1F3C' }}>
                    {award.description}
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: '#94A3B8' }}>
                    {format(new Date(award.issued_at), 'd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {awards.length > 0 && (
        <div
          className="mt-8 p-5 rounded-2xl flex items-center gap-4"
          style={{ background: '#0D1F3C' }}
        >
          <Trophy size={24} color="#F5A623" className="shrink-0" />
          <div>
            <p className="font-bold text-white">Всего наград: {awards.length}</p>
            <p className="text-xs mt-0.5" style={{ color: '#7A8FA8' }}>
              Продолжай участвовать чтобы получать новые награды
            </p>
          </div>
        </div>
      )}
    </div>
  )
}