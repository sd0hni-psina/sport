import { createFileRoute, Link, useNavigate, useRouterState, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { authApi } from '@/api/auth'
import { authStore } from '@/store/auth'
import { Trophy, ArrowRight, Phone, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { PageMeta } from '@/components/shared/PageMeta'


export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    if (authStore.isAuthenticated()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const routerState = useRouterState()

  // берём откуда пришли — history.back()
  // если нет истории — идём на главную
  const from = routerState.location.state?.from as string | undefined

  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.login({ phone_number: phone })
      setStep('code')
      toast.success('SMS-код отправлен')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Ошибка отправки кода')
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
    <PageMeta title="Вход" />
    <div className="min-h-[85vh] flex">

      {/* Левая панель — декоративная */}
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
            Платформа массового спорта
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Участвуй в жизни<br />спортивного Атырау
          </h2>
          <p className="text-sm" style={{ color: '#7A8FA8' }}>
            Записывайся на мероприятия, следи за своими результатами и получай награды
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { num: '124+', label: 'мероприятий в год' },
            { num: '4800+', label: 'активных участников' },
            { num: '18', label: 'спортивных секций' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl font-bold" style={{ color: '#F5A623' }}>{s.num}</span>
              <span className="text-sm" style={{ color: '#7A8FA8' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Правая панель — форма */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Мобильный логотип */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0D1F3C' }}>
              <Trophy size={16} color="#F5A623" />
            </div>
            <span className="font-bold" style={{ color: '#0D1F3C' }}>Атырау Спорт</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0D1F3C' }}>
            {step === 'phone' ? 'Вход в аккаунт' : 'Введите код'}
          </h1>
          <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>
            {step === 'phone'
              ? 'Введите номер телефона — отправим SMS-код'
              : `Код отправлен на ${phone}`}
          </p>

          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>
                  Номер телефона
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                  <input
                    type="tel"
                    placeholder="+7 700 000 00 00"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: '#0D1F3C' }}
              >
                {loading ? 'Отправка...' : 'Получить код'}
                {!loading && <ArrowRight size={15} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>
                  SMS-код
                </label>
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
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: '#0D1F3C' }}
              >
                {loading ? 'Проверка...' : 'Войти'}
                {!loading && <ArrowRight size={15} />}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setCode('') }}
                className="text-sm text-center transition-colors"
                style={{ color: '#94A3B8' }}
              >
                ← Изменить номер
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-8" style={{ color: '#94A3B8' }}>
            Нет аккаунта?{' '}
            <Link to="/auth/register" className="font-semibold" style={{ color: '#0D1F3C' }}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  )
}