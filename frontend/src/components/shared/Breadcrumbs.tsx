import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  to?: string
}

interface Props {
  items: Crumb[]
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav className="flex items-center gap-1.5 text-xs mb-6 flex-wrap">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} color="#CBD5E1" />}
          {item.to && i < items.length - 1 ? (
            <Link
              to={item.to}
              className="font-medium transition-colors hover:text-blue-600"
              style={{ color: '#94A3B8' }}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="font-medium"
              style={{ color: i === items.length - 1 ? '#0D1F3C' : '#94A3B8' }}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}