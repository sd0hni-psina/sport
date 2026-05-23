import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/$404')({
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 text-5xl"
          style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
        >
          🏅
        </div>
        <h1 className="text-6xl font-bold mb-3" style={{ color: '#0D1F3C' }}>404</h1>
        <p className="text-lg font-semibold mb-2" style={{ color: '#0D1F3C' }}>
          Страница не найдена
        </p>
        <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>
          Возможно, она была перемещена или удалена. Вернитесь на главную.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#0D1F3C' }}
          >
            На главную
          </Link>
          <Link
            to="/events"
            className="px-6 py-3 rounded-xl text-sm font-semibold border"
            style={{ borderColor: '#E2E8F0', color: '#0D1F3C' }}
          >
            Мероприятия
          </Link>
        </div>
      </div>
    </div>
  )
}