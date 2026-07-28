import type { ReactNode } from 'react'

type StatusPanelProps = {
  title: string
  children: ReactNode
  action?: ReactNode
  tone?: 'neutral' | 'error'
  isLoading?: boolean
}

export function StatusPanel({ title, children, action, tone = 'neutral', isLoading = false }: StatusPanelProps) {
  return (
    <section
      className={`status-panel status-${tone}${isLoading ? ' status-loading' : ''}`}
      role={tone === 'error' ? 'alert' : isLoading ? 'status' : undefined}
      aria-live={isLoading ? 'polite' : undefined}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <span className="loading-indicator" aria-hidden="true" />}
      <div>
        <h2>{title}</h2>
        <div className="status-description">{children}</div>
        {action && <div className="status-action">{action}</div>}
      </div>
    </section>
  )
}
