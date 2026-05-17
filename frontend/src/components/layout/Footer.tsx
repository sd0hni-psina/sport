import { Trophy } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
              <Trophy size={20} />
              <span>Атырау Спорт</span>
            </div>
            <p className="text-sm">
              Отдел культуры и спорта<br />
              Акимат города Атырау
            </p>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <span className="text-white font-medium mb-1">Навигация</span>
            <a href="/events" className="hover:text-white transition-colors">Мероприятия</a>
            <a href="/news" className="hover:text-white transition-colors">Новости</a>
            <a href="/sections" className="hover:text-white transition-colors">Секции</a>
          </div>

          <div className="text-sm">
            <span className="text-white font-medium block mb-1">Контакты</span>
            <p>г. Атырау, ул. Азаттык 25</p>
            <p>sport@atyrau.gov.kz</p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-xs text-center">
          © {new Date().getFullYear()} Акимат города Атырау. Все права защищены.
        </div>
      </div>
    </footer>
  )
}