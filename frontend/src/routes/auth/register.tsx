import { createFileRoute, Link, useNavigate, useRouterState, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { authApi } from '@/api/auth'
import { authStore } from '@/store/auth'
import { Trophy, ArrowRight, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { PageMeta } from '@/components/shared/PageMeta'


export const Route = createFileRoute('/auth/register')({
  beforeLoad: () => {
    if (authStore.isAuthenticated()) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})

const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
const inputStyle = { border: '1px solid #E2E8F0', color: '#0D1F3C' }
const labelClass = "block text-xs font-semibold mb-1.5"
const labelStyle = { color: '#64748B' }

function RegisterPage() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const from = routerState.location.state?.from as string | undefined
  const [step, setStep] = useState<'form' | 'code'>('form')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    first_name: '', last_name: '', middle_name: '',
    phone_number: '', city: 'Атырау', birth_date: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function validateBirthDate(date: string): string | null {
  const d = new Date(date)
  const now = new Date()
  if (isNaN(d.getTime())) return 'Введите корректную дату рождения'
  if (d > now) return 'Дата рождения не может быть в будущем'
  const age = now.getFullYear() - d.getFullYear()
  if (age > 120) return 'Введите корректную дату рождения'
  return null
}

  function validatePhone(phone: string): string | null {
  const cleaned = phone.replace(/\s/g, '')
  if (!/^\+?[0-9]{10,13}$/.test(cleaned)) {
    return 'Введите корректный номер телефона (например +77001234567)'
  }
  return null
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const phoneError = validatePhone(form.phone_number)
    const birthError = validateBirthDate(form.birth_date)
if (birthError) {
  toast.error(birthError)
  setLoading(false)
  return
}
if (phoneError) {
  toast.error(phoneError)
  setLoading(false)
  return
}

    try {
      await authApi.register({
        ...form,
        middle_name: form.middle_name || undefined,
      })
      setPhone(form.phone_number)
      setStep('code')
      toast.success('SMS-код отправлен')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.verify({ phone_number: phone, code })
      authStore.setTokens(data.access_token, data.refresh_token)
      toast.success('Добро пожаловать!')
      navigate({ to: from ?? '/' })
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Неверный код')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <PageMeta title="Регистрация" />
    <div className="min-h-[85vh] flex">

      {/* Левая панель */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-10"
        style={{ background: '#0D1F3C' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F5A623' }}>
            <Trophy size={18} color="#0D1F3C" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Атырау Спорт</p>
            <p className="text-xs" style={{ color: '#7A8FA8' }}>Акимат города</p>
          </div>
        </div>

        <div>
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-6"
            style={{ background: '#F5A62320', border: '1px solid #F5A62340', color: '#F5A623' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
            Бесплатная регистрация
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Присоединяйся к<br />спортивному Атырау
          </h2>
          <p className="text-sm" style={{ color: '#7A8FA8' }}>
            Зарегистрируйся и получи доступ ко всем мероприятиям, секциям и наградам
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            '✓ Запись на мероприятия онлайн',
            '✓ История участий и награды',
            '✓ Запись детей на секции',
            '✓ Уведомления об изменениях',
          ].map((item, i) => (
            <p key={i} className="text-sm" style={{ color: '#A0AEC0' }}>{item}</p>
          ))}
        </div>
      </div>

      {/* Правая панель */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0D1F3C' }}>
              <Trophy size={16} color="#F5A623" />
            </div>
            <span className="font-bold" style={{ color: '#0D1F3C' }}>Атырау Спорт</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0D1F3C' }}>
            {step === 'form' ? 'Регистрация' : 'Подтверждение'}
          </h1>
          <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>
            {step === 'form'
              ? 'Заполните данные для создания аккаунта'
              : `Код отправлен на ${phone}`}
          </p>

          {step === 'form' ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={labelStyle}>Имя *</label>
                  <input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="Арсен" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Фамилия *</label>
                  <input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Иванов" className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>
                  Отчество <span style={{ color: '#CBD5E1' }}>— необязательно</span>
                </label>
                <input name="middle_name" value={form.middle_name} onChange={handleChange} placeholder="Сериккалиевич" className={inputClass} style={inputStyle} />
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Телефон *</label>
                <input name="phone_number" type="tel" value={form.phone_number} onChange={handleChange} required placeholder="+77001234567" className={inputClass} style={inputStyle} />
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Город *</label>
                <input name="city" value={form.city} onChange={handleChange} required className={inputClass} style={inputStyle} />
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Дата рождения *</label>
                <input name="birth_date" type="date" value={form.birth_date} onChange={handleChange} required className={inputClass} style={inputStyle} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 mt-1"
                style={{ background: '#0D1F3C' }}
              >
                {loading ? 'Отправка...' : 'Зарегистрироваться'}
                {!loading && <ArrowRight size={15} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>SMS-код</label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    maxLength={6}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#0D1F3C' }}
              >
                {loading ? 'Проверка...' : 'Подтвердить'}
                {!loading && <ArrowRight size={15} />}
              </button>

              <button
                type="button"
                onClick={() => { setStep('form'); setCode('') }}
                className="text-sm text-center"
                style={{ color: '#94A3B8' }}
              >
                ← Назад
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-8" style={{ color: '#94A3B8' }}>
            Уже есть аккаунт?{' '}
            <Link to="/auth/login" className="font-semibold" style={{ color: '#0D1F3C' }}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  )
}