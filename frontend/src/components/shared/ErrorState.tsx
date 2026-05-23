import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Не удалось загрузить данные', onRetry }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl"
      style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
    >
      <AlertCircle size={32} color="#DC2626" className="mb-3" />
      <p className="text-sm font-semibold mb-1" style={{ color: '#DC2626' }}>Ошибка загрузки</p>
      <p className="text-xs text-center mb-4" style={{ color: '#94A3B8' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{ background: '#DC2626', color: '#fff' }}
        >
          <RefreshCw size={13} />
          Попробовать снова
        </button>
      )}
    </div>
  )
}