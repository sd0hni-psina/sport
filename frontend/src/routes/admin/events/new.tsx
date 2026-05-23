import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { apiClient } from '@/api/client'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/events/new')({
  component: AdminEventNewPage,
})

const SPORT_TYPES = [
  'Бег', 'Футбол', 'Баскетбол', 'Волейбол',
  'Плавание', 'Велоспорт', 'Теннис', 'Бокс', 'Йога', 'Другое',
]

const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
const inputStyle = { border: '1px solid #E2E8F0', color: '#0D1F3C' }
const labelClass = "block text-xs font-semibold mb-1.5"
const labelStyle = { color: '#64748B' }

function AdminEventNewPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    sport_type: '',
    description: '',
    location: '',
    location_lat: '',
    location_lng: '',
    time_start: '',
    time_end: '',
    instructor_name: '',
    instructor_bio: '',
    min_age: '',
    max_age: '',
    max_participants: '',
    prizes: '',
    cancel_deadline_hrs: '24',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload: Record<string, any> = {
        name:               form.name,
        sport_type:         form.sport_type,
        description:        form.description,
        location:           form.location,
        time_start:         new Date(form.time_start).toISOString(),
        time_end:           new Date(form.time_end).toISOString(),
        cancel_deadline_hrs: Number(form.cancel_deadline_hrs) || 24,
      }

      if (form.location_lat)    payload.location_lat    = parseFloat(form.location_lat)
      if (form.location_lng)    payload.location_lng    = parseFloat(form.location_lng)
      if (form.instructor_name) payload.instructor_name = form.instructor_name
      if (form.instructor_bio)  payload.instructor_bio  = form.instructor_bio
      if (form.min_age)         payload.min_age         = Number(form.min_age)
      if (form.max_age)         payload.max_age         = Number(form.max_age)
      if (form.max_participants) payload.max_participants = Number(form.max_participants)
      if (form.prizes)          payload.prizes          = form.prizes

      await apiClient.post('/admin/events', payload)
toast.success('Мероприятие создано')
navigate({ to: '/admin/events' })
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Ошибка при создании')
setError(err.response?.data?.error ?? 'Ошибка при создании')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/admin/events"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: '#F1F5F9', color: '#64748B' }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0D1F3C' }}>Новое мероприятие</h1>
          <p className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>Заполните форму и сохраните</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Основное */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
          <h2 className="text-sm font-bold mb-5" style={{ color: '#0D1F3C' }}>Основная информация</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>Название *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Городской забег 5 км" className={inputClass} style={inputStyle} />
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Вид спорта *</label>
              <select name="sport_type" value={form.sport_type} onChange={handleChange} required className={inputClass} style={inputStyle}>
                <option value="">— Выберите —</option>
                {SPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Описание *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Подробное описание мероприятия..."
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Место и время */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
          <h2 className="text-sm font-bold mb-5" style={{ color: '#0D1F3C' }}>Место и время</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>Место проведения *</label>
              <input name="location" value={form.location} onChange={handleChange} required placeholder="СК «Атырау», ул. Азаттык 25" className={inputClass} style={inputStyle} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>Широта (необязательно)</label>
                <input name="location_lat" value={form.location_lat} onChange={handleChange} placeholder="47.1167" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Долгота (необязательно)</label>
                <input name="location_lng" value={form.location_lng} onChange={handleChange} placeholder="51.8833" className={inputClass} style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>Начало *</label>
                <input type="datetime-local" name="time_start" value={form.time_start} onChange={handleChange} required className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Конец *</label>
                <input type="datetime-local" name="time_end" value={form.time_end} onChange={handleChange} required className={inputClass} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Участники */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
          <h2 className="text-sm font-bold mb-5" style={{ color: '#0D1F3C' }}>Участники</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass} style={labelStyle}>Мин. возраст</label>
                <input type="number" name="min_age" value={form.min_age} onChange={handleChange} placeholder="6" min="0" max="100" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Макс. возраст</label>
                <input type="number" name="max_age" value={form.max_age} onChange={handleChange} placeholder="60" min="0" max="100" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Макс. участников</label>
                <input type="number" name="max_participants" value={form.max_participants} onChange={handleChange} placeholder="100" min="1" className={inputClass} style={inputStyle} />
              </div>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Дедлайн отмены (часов до начала)</label>
              <input type="number" name="cancel_deadline_hrs" value={form.cancel_deadline_hrs} onChange={handleChange} min="1" className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Инструктор и призы */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
          <h2 className="text-sm font-bold mb-5" style={{ color: '#0D1F3C' }}>Инструктор и призы</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>Имя инструктора</label>
              <input name="instructor_name" value={form.instructor_name} onChange={handleChange} placeholder="Иванов Иван" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>О инструкторе</label>
              <textarea name="instructor_bio" value={form.instructor_bio} onChange={handleChange} rows={2} placeholder="Мастер спорта, 10 лет опыта..." className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Призы и награды</label>
              <input name="prizes" value={form.prizes} onChange={handleChange} placeholder="1 место — медаль, 2 место — грамота" className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#FEF2F2', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3 pb-6">
          <Link
            to="/admin/events"
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center border transition-colors"
            style={{ borderColor: '#E2E8F0', color: '#64748B' }}
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: '#0D1F3C' }}
          >
            {loading ? 'Сохранение...' : 'Создать мероприятие'}
          </button>
        </div>
      </form>
    </div>
  )
}