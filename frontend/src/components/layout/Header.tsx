import { Link } from '@tanstack/react-router'
import { authStore } from '@/store/auth'
import { useState } from 'react'
import { Menu, X, Trophy } from 'lucide-react'

const navLinks = [
  { to: '/events', label: 'Мероприятия' },
  { to: '/news', label: 'Новости' },
  { to: '/sections', label: 'Секции' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const isAuth = authStore.isAuthenticated()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Лого */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-blue-600">
            <Trophy size={22} />
            <span>Атырау Спорт</span>
          </Link>

          {/* Десктоп навигация */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                activeProps={{ className: 'text-blue-600' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Кнопки справа */}
          <div className="hidden md:flex items-center gap-3">
            {isAuth ? (
              <Link
                to="/profile"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Профиль
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/auth/register"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Бургер для мобилки */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-gray-600 py-2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuth ? (
            <Link to="/profile" className="text-sm font-medium text-blue-600 py-2">
              Профиль
            </Link>
          ) : (
            <>
              <Link to="/auth/login" className="text-sm font-medium text-gray-600 py-2">
                Войти
              </Link>
              <Link to="/auth/register" className="text-sm font-medium text-blue-600 py-2">
                Регистрация
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}