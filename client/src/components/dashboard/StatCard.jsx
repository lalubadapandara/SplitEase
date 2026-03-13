import React from 'react'

export default function StatCard({ label, amount, sub, variant = 'neutral' }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-label">{label}</div>
      <div className={`stat-amount ${variant === 'owed' ? 'positive' : variant === 'owe' ? 'negative' : 'neutral'}`}>
        {amount}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}
