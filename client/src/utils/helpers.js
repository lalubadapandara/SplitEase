/**
 * Format number as Indian Rupee
 */
export const formatCurrency = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

/**
 * Get initials from full name
 */
export const getInitials = (name) =>
  name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

/**
 * Relative time string
 */
export const timeAgo = (date) => {
  const d = new Date(date), now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Debt simplification algorithm
 * Minimises the number of transactions needed to settle all debts
 */
export const simplifyDebts = (members, balances) => {
  const memberMap = {}
  members.forEach(m => { memberMap[m._id] = m })

  const creditors = []
  const debtors = []

  Object.entries(balances).forEach(([id, bal]) => {
    if (bal > 0.01) creditors.push({ id, balance: bal })
    else if (bal < -0.01) debtors.push({ id, balance: -bal })
  })

  const transactions = []
  const cred = creditors.map(x => ({ ...x }))
  const debt = debtors.map(x => ({ ...x }))
  let i = 0, j = 0

  while (i < cred.length && j < debt.length) {
    const amount = Math.min(cred[i].balance, debt[j].balance)
    transactions.push({
      from: memberMap[debt[j].id],
      to: memberMap[cred[i].id],
      amount: Math.round(amount * 100) / 100,
    })
    cred[i].balance -= amount
    debt[j].balance -= amount
    if (cred[i].balance < 0.01) i++
    if (debt[j].balance < 0.01) j++
  }

  return transactions
}

/**
 * Calculate per-member balances from expenses and settlements
 */
export const calculateBalances = (members, expenses, settlements = []) => {
  const balances = {}
  members.forEach(m => { balances[m._id] = 0 })

  expenses.forEach(exp => {
    const paidById = exp.paidBy._id || exp.paidBy
    exp.participants.forEach(p => {
      const userId = p.user._id || p.user
      if (userId !== paidById) {
        balances[paidById] = (balances[paidById] || 0) + p.shareAmount
        balances[userId] = (balances[userId] || 0) - p.shareAmount
      }
    })
  })

  settlements.forEach(s => {
    const payerId = s.payer._id || s.payer
    const receiverId = s.receiver._id || s.receiver
    balances[payerId] = (balances[payerId] || 0) + s.amount
    balances[receiverId] = (balances[receiverId] || 0) - s.amount
  })

  return balances
}

/**
 * Compute equal share amounts for participants
 */
export const computeEqualShares = (amount, count) =>
  Math.round((amount / count) * 100) / 100

/**
 * Validate expense form data
 */
export const validateExpense = ({ title, amount, participants }) => {
  if (!title?.trim()) return 'Expense title is required'
  if (!amount || isNaN(amount) || Number(amount) <= 0) return 'Enter a valid amount'
  if (!participants || participants.filter(p => p.selected).length === 0) return 'Select at least one participant'
  return null
}
