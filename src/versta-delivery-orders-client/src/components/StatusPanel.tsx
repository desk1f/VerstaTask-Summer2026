import type { ReactNode } from 'react'

type StatusPanelProps = {
  title: string
  children: ReactNode
  action?: ReactNode
  tone?: 'neutral' | 'error'
}

export function StatusPanel({ title, children, action, tone = 'neutral' }: StatusPanelProps) {
  return (
    <section className={`status-panel status-${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      <h2>{title}</h2>
      <div className="status-description">{children}</div>
      {action && <div className="status-action">{action}</div>}
    </section>
  )
}
