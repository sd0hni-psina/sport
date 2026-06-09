import { useState, useRef } from 'react'
import { apiClient } from '@/api/client'
import { Upload, X, Image } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = 'Изображение' }: Props) {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 10MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Разрешены только изображения')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await apiClient.post<{ url: string }>('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      onChange(data.url)
      toast.success('Фото загружено')
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Ошибка загрузки')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-semibold" style={{ color: '#64748B' }}>
        {label}
      </label>

      {value ? (
        <div className="relative rounded-xl overflow-hidden" style={{ height: '180px' }}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="opacity-0 hover:opacity-100 w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
              style={{ background: '#fff' }}
            >
              <Upload size={16} color="#0D1F3C" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="opacity-0 hover:opacity-100 w-9 h-9 rounded-full flex items-center justify-center transition-opacity"
              style={{ background: '#DC2626' }}
            >
              <X size={16} color="#fff" />
            </button>
          </div>
          {/* показываем кнопки всегда на мобилке */}
          <div className="absolute bottom-2 right-2 flex gap-2 md:hidden">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              <Upload size={13} color="#0D1F3C" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#DC2626' }}
            >
              <X size={13} color="#fff" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex flex-col items-center justify-center gap-2 rounded-xl transition-colors disabled:opacity-50"
          style={{
            height: '120px',
            border: '2px dashed #E2E8F0',
            background: loading ? '#F8FAFC' : '#fff',
          }}
        >
          {loading ? (
            <>
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#0D1F3C', borderTopColor: 'transparent' }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>Загрузка...</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F1F5F9' }}>
                <Image size={20} color="#94A3B8" />
              </div>
              <span className="text-xs font-medium" style={{ color: '#64748B' }}>
                Нажмите чтобы загрузить
              </span>
              <span className="text-xs" style={{ color: '#94A3B8' }}>
                JPG, PNG, WebP до 10MB
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* Альтернативно — вставить URL вручную */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
        <span className="text-xs" style={{ color: '#94A3B8' }}>или</span>
        <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
      </div>

      <input
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Вставить URL изображения..."
        className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
      />
    </div>
  )
}