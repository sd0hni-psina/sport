import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { apiClient } from '@/api/client'
import { authStore } from '@/store/auth'
import { toast } from 'sonner'
import { PageMeta } from '@/components/shared/PageMeta'
import { CheckCircle } from 'lucide-react'
import { getApiError } from '@/lib/handle-api-error'


export const Route = createFileRoute('/suggest')({
  beforeLoad: ({ location }) => {
    if (!authStore.isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
        state: { from: location.href },
      })
    }
  },
  component: SuggestPage,
})

const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
const inputStyle = { border: '1px solid #E2E8F0', color: '#0D1F3C' }

function SuggestPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ text: '', contact: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post('/suggestions', form)
      setSubmitted(true)
      toast.success('Предложение отправлено!')
    } catch (err: any) {
      toast.error(getApiError(err))

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <PageMeta title="Предложить мероприятие" />

      {submitted ? (
        <div className="text-center py-16">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ background: '#ECFDF5' }}
          >
            <CheckCircle size={36} color="#059669" />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: '#0D1F3C' }}>
            Предложение отправлено!
          </h1>
          <p className="text-sm mb-8" style={{ color: '#64748B' }}>
            Мы рассмотрим вашу идею и свяжемся с вами если она будет реализована
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#0D1F3C' }}
            >
              К мероприятиям
            </Link>
            <button
              onClick={() => { setSubmitted(false); setForm({ text: '', contact: '' }) }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: '#E2E8F0', color: '#64748B' }}
            >
              Предложить ещё
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Шапка */}
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4"
              style={{ background: '#FFF8E7', border: '1px solid #FDE68A', color: '#D97706' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
              Идеи от горожан
            </div>
            <h1 className="text-3xl font-bold mb-3" style={{ color: '#0D1F3C' }}>
              Предложить мероприятие
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Есть идея для спортивного события? Расскажите нам — лучшие идеи мы воплощаем в жизнь
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0' }}>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>
                    Ваша идея *
                  </label>
                  <textarea
                    name="text"
                    value={form.text}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Опишите мероприятие которое хотели бы увидеть в Атырау. Например: городской турнир по настольному теннису для взрослых..."
                    className={inputClass}
                    style={inputStyle}
                  />
                  <p className="text-xs mt-1.5" style={{ color: '#94A3B8' }}>
                    Минимум 10 символов
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>
                    Контакт для связи
                    <span className="font-normal ml-1" style={{ color: '#CBD5E1' }}>— необязательно</span>
                  </label>
                  <input
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    placeholder="Телефон или email"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || form.text.length < 10}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: '#0D1F3C' }}
            >
              {loading ? 'Отправка...' : 'Отправить предложение'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}