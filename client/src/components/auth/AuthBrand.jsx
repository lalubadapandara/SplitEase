import React from 'react'

const FEATURES = [
  ['💸', 'Split bills equally or by custom amounts'],
  ['📊', 'Track real-time balances across groups'],
  ['🤝', 'Settle up with one click'],
  ['📈', 'Visualise your spending by category'],
]

export default function AuthBrand() {
  return (
    <div className="auth-brand">
      <div className="brand-content">
        <div className="brand-logo">SplitEase</div>
        <p className="brand-tagline">
          The simplest way to split expenses with friends, roommates, and travel buddies.
        </p>
        <div className="brand-features">
          {FEATURES.map(([icon, text]) => (
            <div key={text} className="brand-feat">
              <div className="feat-icon">{icon}</div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
