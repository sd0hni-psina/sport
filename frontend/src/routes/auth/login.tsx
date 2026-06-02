import { createFileRoute, Link, useNavigate, useRouterState, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { authApi } from '@/api/auth'
import { authStore } from '@/store/auth'
import { Trophy, ArrowRight, Phone, KeyRound, Mail } from 'lucide-react'
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

type Method = 'phone' | 'email'
type Step = 'input' | 'code'

function LoginPage() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const from = routerState.location.state?.from as string | undefined

  const [method, setMethod] = useState<Method>('phone')
  const [step, setStep] = useState<Step>('input')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (method === 'phone') {
        await authApi.login({ phone_number: phone })
      } else {
        await authApi.loginEmail({ email })
      }
      setStep('code')
      toast.success(method === 'phone' ? 'SMS-код отправлен' : 'Код отправлен на email')
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
      let tokens
      if (method === 'phone') {
        const { data } = await authApi.verify({ phone_number: phone, code })
        tokens = data
      } else {
        const { data } = await authApi.verifyEmail({ email, code })
        tokens = data
      }
      authStore.setTokens(tokens.access_token, tokens.refresh_token)
      toast.success('Добро пожаловать!')
      navigate({ to: (from ?? '/') as any })
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Неверный код')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex">
      <PageMeta title="Вход" />

      {/* Левая панель */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-10" style={{ background: '#0D1F3C' }}>
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
            { num: '124+', label: 'мероприятий в год'    },
            { num: '4800+', label: 'активных участников' },
            { num: '18',   label: 'спортивных секций'    },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl font-bold" style={{ color: '#F5A623' }}>{s.num}</span>
              <span className="text-sm" style={{ color: '#7A8FA8' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Правая панель */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-white">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0D1F3C' }}>
              <Trophy size={16} color="#F5A623" />
            </div>
            <span className="font-bold" style={{ color: '#0D1F3C' }}>Атырау Спорт</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0D1F3C' }}>
            {step === 'input' ? 'Вход в аккаунт' : 'Введите код'}
          </h1>
          <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
            {step === 'input'
              ? 'Выберите способ входа'
              : method === 'phone'
                ? `Код отправлен на ${phone}`
                : `Код отправлен на ${email}`
            }
          </p>

          {/* Переключатель метода */}
          {step === 'input' && (
            <div
              className="flex rounded-xl p-1 mb-6"
              style={{ background: '#F1F5F9' }}
            >
              <button
                onClick={() => setMethod('phone')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
                style={method === 'phone'
                  ? { background: '#fff', color: '#0D1F3C', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { color: '#94A3B8' }
                }
              >
                <Phone size={14} />
                Телефон
              </button>
              <button
                onClick={() => setMethod('email')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
                style={method === 'email'
                  ? { background: '#fff', color: '#0D1F3C', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { color: '#94A3B8' }
                }
              >
                <Mail size={14} />
                Email
              </button>
            </div>
          )}

          {step === 'input' ? (
            <form onSubmit={handleSend} className="flex flex-col gap-4">
              {method === 'phone' ? (
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
              ) : (
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748B' }}>
                    Email адрес
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
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
                  {method === 'phone' ? 'SMS-код' : 'Код из письма'}
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
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#0D1F3C' }}
              >
                {loading ? 'Проверка...' : 'Войти'}
                {!loading && <ArrowRight size={15} />}
              </button>

              <button
                type="button"
                onClick={() => { setStep('input'); setCode('') }}
                className="text-sm text-center"
                style={{ color: '#94A3B8' }}
              >
                ← Изменить
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
  )
}