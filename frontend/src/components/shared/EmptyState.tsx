interface Props {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '📭', title, description, action }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl"
      style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
    >
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-sm font-semibold mb-1" style={{ color: '#0D1F3C' }}>{title}</p>
      {description && (
        <p className="text-xs text-center mb-4" style={{ color: '#94A3B8' }}>{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}