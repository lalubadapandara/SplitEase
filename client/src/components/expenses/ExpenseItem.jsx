import React from 'react'
import { CATEGORY_CONFIG } from '../../utils/constants'
import { formatCurrency, timeAgo } from '../../utils/helpers'

export default function ExpenseItem({ expense, currentUserId, showGroup = false, onEdit, onDelete }) {
  const cat    = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.other
  const myPart = expense.participants?.find(p => (p.user?._id || p.user) === currentUserId)
  const iPaid  = (expense.paidBy?._id || expense.paidBy) === currentUserId

  return (
    <div className="expense-item">
      <div className={`expense-cat-icon ${cat.className}`}>{cat.icon}</div>

      <div className="expense-info">
        <div className="expense-title">{expense.title}</div>
        <div className="expense-meta">
          {showGroup && expense.group?.name && (
            <span className="badge badge-accent" style={{ marginRight: 6 }}>{expense.group.name}</span>
          )}
          Paid by <strong>{expense.paidBy?.name || 'Unknown'}</strong>
          {' · '}{expense.participants?.length} people
          {' · '}{timeAgo(expense.date)}
        </div>
        {expense.description && (
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{expense.description}</div>
        )}
        {/* Action buttons — only for the payer */}
        {iPaid && (onEdit || onDelete) && (
          <div className="expense-actions">
            {onEdit && (
              <button className="expense-action-btn" onClick={() => onEdit(expense)}>
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button className="expense-action-btn danger" onClick={() => onDelete(expense)}>
                🗑️ Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="expense-amount">
        <div className="expense-total">{formatCurrency(expense.amount)}</div>
        {myPart && (
          <div className={`expense-share ${iPaid ? 'you-paid' : 'you-owe'}`}>
            {iPaid ? 'you paid' : `you owe ${formatCurrency(myPart.shareAmount)}`}
          </div>
        )}
      </div>
    </div>
  )
}
