import { Trophy } from 'lucide-react'

export function Footer() {
  return (
    <footer style={{ background: '#0D1F3C' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8" style={{ borderBottom: '1px solid #1A3259' }}>

          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F5A623' }}>
                <Trophy size={16} color="#0D1F3C" />
              </div>
              <span className="text-white font-semibold text-sm">Атырау Спорт</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#7A8FA8' }}>
              Платформа для цифровизации<br />
              массовых спортивных мероприятий<br />
              города Атырау
            </p>
          </div>

          <div>
            <p className="text-white text-sm font-semibold mb-3">Разделы</p>
            <div className="flex flex-col gap-2 text-sm" style={{ color: '#7A8FA8' }}>
              <a href="/events" className="hover:text-white transition-colors">Мероприятия</a>
              <a href="/news"   className="hover:text-white transition-colors">Новости</a>
              <a href="/sections" className="hover:text-white transition-colors">Секции</a>
            </div>
          </div>

          <div>
            <p className="text-white text-sm font-semibold mb-3">Контакты</p>
            <div className="flex flex-col gap-2 text-sm" style={{ color: '#7A8FA8' }}>
              <span>г. Атырау, ул. Азаттык 25</span>
              <span>sport@atyrau.gov.kz</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-xs" style={{ color: '#7A8FA8' }}>
            © {new Date().getFullYear()} Акимат города Атырау
          </span>
          <span className="text-xs" style={{ color: '#4A5568' }}>
            Отдел культуры и спорта
          </span>
        </div>
      </div>
    </footer>
  )
}