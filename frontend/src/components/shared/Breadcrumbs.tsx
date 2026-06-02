import { Link } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb {
  label: string
  to?: string
}

interface Props {
  items: Crumb[]
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav className="flex items-center gap-1 text-xs mb-6 overflow-hidden">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        const isFirst = i === 0

        return (
          <div key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && (
              <ChevronRight size={12} className="shrink-0" style={{ color: '#CBD5E1' }} />
            )}

            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="font-medium transition-colors hover:text-blue-600 flex items-center gap-1 shrink-0"
                style={{ color: '#94A3B8' }}
              >
                {isFirst && <Home size={11} />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className="font-medium truncate"
                style={{
                  color: isLast ? '#0D1F3C' : '#94A3B8',
                  maxWidth: isLast ? '200px' : undefined,
                }}
                title={isLast ? item.label : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}