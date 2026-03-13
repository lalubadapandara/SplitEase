import React from 'react'
import Avatar from '../ui/Avatar'
import { formatCurrency } from '../../utils/helpers'

export default function TransactionRow({ transaction, currentUserId, onSettle }) {
  const isInvolved =
    transaction.from?._id === currentUserId ||
    transaction.to?._id === currentUserId

  return (
    <div className="balance-item">
      <div className="balance-names">
        <Avatar name={transaction.from?.name} size="sm" />
        <span>{transaction.from?.name}</span>
        <span className="balance-arrow">→</span>
        <Avatar name={transaction.to?.name} size="sm" />
        <span>{transaction.to?.name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="balance-amount-negative">{formatCurrency(transaction.amount)}</span>
        {isInvolved && (
          <button className="btn btn-success btn-sm" onClick={() => onSettle(transaction)}>
            Settle
          </button>
        )}
      </div>
    </div>
  )
}
