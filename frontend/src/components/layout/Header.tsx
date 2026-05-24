import { Link } from '@tanstack/react-router'
import { useSyncExternalStore, useState } from 'react'
import { authStore } from '@/store/auth'
import { Menu, X, Trophy } from 'lucide-react'

const navLinks = [
  { to: '/events',    label: 'Мероприятия' },
  { to: '/news',      label: 'Новости'     },
  { to: '/sections',  label: 'Секции'      },
  { to: '/analytics', label: 'Статистика'  },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const isAuth = useSyncExternalStore(
    authStore.subscribe,
    authStore.isAuthenticated,
    authStore.isAuthenticated,
  )
  const isAdmin = useSyncExternalStore(
    authStore.subscribe,
    authStore.isAdmin,
    authStore.isAdmin,
  )

  return (
    <header className="sticky top-0 z-50" style={{ background: '#0D1F3C' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#F5A623' }}>
              <Trophy size={18} color="#0D1F3C" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-white text-sm">Атырау Спорт</span>
              <span className="text-xs" style={{ color: '#7A8FA8' }}>Акимат города</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: '#A0AEC0' }}
                activeProps={{ style: { color: '#ffffff', background: '#1A3259' } }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuth ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: '#F5A623' }}
                  >
                    Админка
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ background: '#F5A623', color: '#0D1F3C' }}
                >
                  Профиль
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ color: '#A0AEC0' }}
                >
                  Войти
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: '#F5A623', color: '#0D1F3C' }}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#A0AEC0' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1" style={{ borderColor: '#1A3259', background: '#0D1F3C' }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2.5 rounded-lg text-sm font-medium"
              style={{ color: '#A0AEC0' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t mt-2 pt-2 flex flex-col gap-1" style={{ borderColor: '#1A3259' }}>
            {isAuth ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="px-3 py-2.5 text-sm font-medium" style={{ color: '#F5A623' }} onClick={() => setMenuOpen(false)}>
                    Админка
                  </Link>
                )}
                <Link to="/profile" className="px-3 py-2.5 text-sm font-semibold" style={{ color: '#F5A623' }} onClick={() => setMenuOpen(false)}>
                  Профиль
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="px-3 py-2.5 text-sm font-medium" style={{ color: '#A0AEC0' }} onClick={() => setMenuOpen(false)}>
                  Войти
                </Link>
                <Link to="/auth/register" className="px-3 py-2.5 text-sm font-semibold" style={{ color: '#F5A623' }} onClick={() => setMenuOpen(false)}>
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}