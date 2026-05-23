import { createFileRoute, Outlet, Link, redirect, useRouterState } from '@tanstack/react-router'
import { authStore } from '@/store/auth'
import {
  LayoutDashboard, Calendar, FileText,
  Users, ClipboardList, LogOut, Trophy, Menu, X
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    if (!authStore.isAuthenticated()) {
      throw redirect({ to: '/auth/login' })
    }
    if (!authStore.isAdmin()) {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayout,
})

const sideLinks = [
  { to: '/admin',               label: 'Дашборд',       icon: LayoutDashboard, exact: true },
  { to: '/admin/events',        label: 'Мероприятия',   icon: Calendar        },
  { to: '/admin/applications',  label: 'Заявки',        icon: ClipboardList   },
  { to: '/admin/news',          label: 'Новости',       icon: FileText        },
  { to: '/admin/users',         label: 'Пользователи',  icon: Users           },
]

function AdminLayout() {
  const [sideOpen, setSideOpen] = useState(false)
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  function isActive(to: string, exact?: boolean) {
    if (exact) return currentPath === to
    return currentPath.startsWith(to)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <header className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 sm:px-6" style={{ background: '#0D1F3C', borderBottom: '1px solid #1A3259' }}>
        <div className="flex items-center gap-3">
          <button className="md:hidden p-1.5 rounded-lg" style={{ color: '#A0AEC0' }} onClick={() => setSideOpen(!sideOpen)}>
            {sideOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#F5A623' }}>
              <Trophy size={14} color="#0D1F3C" />
            </div>
            <span className="text-white font-semibold text-sm">Атырау Спорт</span>
            <span className="text-xs px-2 py-0.5 rounded-md font-medium ml-1" style={{ background: '#1A3259', color: '#7A8FA8' }}>
              Админ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs font-medium" style={{ color: '#7A8FA8' }}>
            ← На сайт
          </Link>
          <button
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ color: '#7A8FA8', background: '#1A3259' }}
            onClick={() => { authStore.clearTokens(); window.location.href = '/' }}
          >
            <LogOut size={13} />
            Выйти
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto" style={{ background: '#0D1F3C', borderRight: '1px solid #1A3259' }}>
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {sideLinks.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={isActive(to, exact)
                  ? { background: '#1A3259', color: '#ffffff' }
                  : { color: '#7A8FA8' }
                }
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {sideOpen && (
          <div className="md:hidden fixed inset-0 z-40" onClick={() => setSideOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <aside
              className="absolute left-0 top-14 bottom-0 w-56 flex flex-col overflow-y-auto"
              style={{ background: '#0D1F3C', borderRight: '1px solid #1A3259' }}
              onClick={e => e.stopPropagation()}
            >
              <nav className="flex flex-col gap-1 p-3">
                {sideLinks.map(({ to, label, icon: Icon, exact }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium"
                    style={isActive(to, exact)
                      ? { background: '#1A3259', color: '#ffffff' }
                      : { color: '#7A8FA8' }
                    }
                    onClick={() => setSideOpen(false)}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}