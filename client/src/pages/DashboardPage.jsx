import React from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/dashboard/StatCard'
import SpendingChart from '../components/dashboard/SpendingChart'
import ExpenseItem from '../components/expenses/ExpenseItem'
import { useAuth } from '../hooks/useAuth'
import { useExpenses } from '../hooks/useExpenses'
import { useGroups } from '../hooks/useGroups'
import { formatCurrency } from '../utils/helpers'
import { CATEGORY_CONFIG } from '../utils/constants'

export default function DashboardPage() {
  const { user } = useAuth()
  const { expenses, loading: exLoading } = useExpenses()
  const { groups, loading: grLoading } = useGroups()

  // Compute summary totals
  let totalOwed = 0, totalOwe = 0
  expenses.forEach(exp => {
    const paidById = exp.paidBy?._id || exp.paidBy
    const iPaid = paidById === user._id
    exp.participants?.forEach(p => {
      const uid = p.user?._id || p.user
      if (iPaid && uid !== user._id) totalOwed += p.shareAmount
      else if (!iPaid && uid === user._id) totalOwe += p.shareAmount
    })
  })
  const netBalance = totalOwed - totalOwe

  // Spending by category
  const catTotals = {}
  expenses.forEach(exp => {
    catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount
  })
  const chartData = Object.entries(catTotals).map(([cat, val]) => ({
    label: CATEGORY_CONFIG[cat]?.label || cat,
    value: val,
  }))

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good to see you, {firstName} 👋</h1>
          <p className="page-subtitle">Here's your expense overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="You Are Owed"
          amount={formatCurrency(totalOwed)}
          sub="From group expenses"
          variant="owed"
        />
        <StatCard
          label="You Owe"
          amount={formatCurrency(totalOwe)}
          sub="To group members"
          variant="owe"
        />
        <StatCard
          label="Net Balance"
          amount={`${netBalance >= 0 ? '+' : ''}${formatCurrency(netBalance)}`}
          sub="Overall position"
          variant="net"
        />
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid">
        {/* Recent expenses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Expenses</h3>
            {expenses.length > 0 && (
              <Link to="/expenses" className="badge badge-accent" style={{ textDecoration: 'none' }}>
                View all
              </Link>
            )}
          </div>
          {exLoading ? (
            <div className="full-loading"><span className="loading" /></div>
          ) : expenses.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 20px' }}>
              <span className="empty-icon">💸</span>
              <p className="empty-text">No expenses yet</p>
              <p className="empty-sub">Add your first expense inside a group</p>
            </div>
          ) : (
            <div className="expense-list">
              {expenses.slice(0, 6).map(exp => (
                <ExpenseItem key={exp._id} expense={exp} currentUserId={user._id} showGroup />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Spending chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Spending by Category</h3>
            </div>
            {chartData.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 20px' }}>
                <span className="empty-icon">📊</span>
                <p className="empty-text" style={{ fontSize: 14 }}>No data yet</p>
              </div>
            ) : (
              <SpendingChart data={chartData} />
            )}
          </div>

          {/* Active groups */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Your Groups</h3>
              {groups.length > 0 && (
                <Link to="/groups" className="badge badge-accent" style={{ textDecoration: 'none' }}>
                  View all
                </Link>
              )}
            </div>
            {grLoading ? (
              <div className="full-loading" style={{ minHeight: 80 }}><span className="loading" /></div>
            ) : groups.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 20px' }}>
                <span className="empty-icon">👥</span>
                <p className="empty-text" style={{ fontSize: 14 }}>No groups yet</p>
                <p className="empty-sub">
                  <Link to="/groups" style={{ color: 'var(--accent)' }}>Create your first group</Link>
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groups.slice(0, 5).map(g => (
                  <Link
                    key={g._id}
                    to={`/groups/${g._id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', background: 'var(--surface2)',
                      borderRadius: 10, textDecoration: 'none', color: 'inherit',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{g.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{g.members?.length} member{g.members?.length !== 1 ? 's' : ''}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
