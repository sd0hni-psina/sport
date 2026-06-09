import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
}

export function AnimatedCounter({ value, duration = 1500 }: Props) {
  const [display, setDisplay] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef<number>(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!value) return

    startValueRef.current = display
    startTimeRef.current = null

    function animate(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValueRef.current + (value - startValueRef.current) * eased)

      setDisplay(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value])

  return <span>{display.toLocaleString('ru')}</span>
}