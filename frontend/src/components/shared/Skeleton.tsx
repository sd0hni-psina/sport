import { cn } from '@/lib/utils'

interface Props {
  className?: string
  count?: number
}

export function Skeleton({ className, count = 1 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('animate-pulse rounded-xl bg-slate-100', className)}
        />
      ))}
    </>
  )
}