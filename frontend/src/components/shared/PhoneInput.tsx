
interface Props {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function PhoneInput({ value, onChange, required }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/[^\d+]/g, '')

    // автоматически добавляем +7 если пользователь начинает с 8 или 7
    if (val.startsWith('8') && val.length === 1) {
      val = '+7'
    } else if (val.startsWith('77') && !val.startsWith('+')) {
      val = '+' + val
    }

    // форматируем: +7 (XXX) XXX-XX-XX
    if (val.startsWith('+7') && val.length > 2) {
      const digits = val.slice(2).replace(/\D/g, '')
      let formatted = '+7'
      if (digits.length > 0) formatted += ' (' + digits.slice(0, 3)
      if (digits.length >= 3) formatted += ') ' + digits.slice(3, 6)
      if (digits.length >= 6) formatted += '-' + digits.slice(6, 8)
      if (digits.length >= 8) formatted += '-' + digits.slice(8, 10)
      onChange(formatted)
      return
    }

    onChange(val)
  }

  // для отправки на сервер убираем форматирование
  function getRawValue() {
    return value.replace(/[\s\(\)\-]/g, '')
  }

  return (
    <div className="relative">
      <input
        type="tel"
        value={value}
        onChange={handleChange}
        required={required}
        placeholder="+7 (700) 000-00-00"
        maxLength={18}
        className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ border: '1px solid #E2E8F0', color: '#0D1F3C' }}
      />
      {/* скрытый input для формы с чистым значением */}
      <input type="hidden" name="phone_raw" value={getRawValue()} />
    </div>
  )
}