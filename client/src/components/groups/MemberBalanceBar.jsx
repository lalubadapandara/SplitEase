import React from 'react'
import Avatar from '../ui/Avatar'
import { formatCurrency } from '../../utils/helpers'

export default function MemberBalanceBar({ member, balance }) {
  const cls = balance > 0 ? 'balance-amount-positive' : balance < 0 ? 'balance-amount-negative' : 'balance-amount-neutral'
  const label = balance > 0
    ? `+${formatCurrency(balance)}`
    : balance < 0
    ? `-${formatCurrency(-balance)}`
    : 'Settled'

  return (
    <div className="balance-item">
      <div className="balance-names">
        <Avatar name={member.name} size="sm" />
        <span>{member.name}</span>
      </div>
      <div className={cls}>{label}</div>
    </div>
  )
}
