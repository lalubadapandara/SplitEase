import React from 'react'

export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-text">{title}</div>
      {subtitle && <div className="empty-sub">{subtitle}</div>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  )
}
