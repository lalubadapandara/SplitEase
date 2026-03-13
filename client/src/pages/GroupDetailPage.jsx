import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Tabs from '../components/ui/Tabs'
import EmptyState from '../components/ui/EmptyState'
import ExpenseItem from '../components/expenses/ExpenseItem'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import MemberBalanceBar from '../components/groups/MemberBalanceBar'
import TransactionRow from '../components/settlements/TransactionRow'
import SettleModal from '../components/settlements/SettleModal'
import InviteModal from '../components/groups/InviteModal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Modal from '../components/ui/Modal'
import { useGroups } from '../hooks/useGroups'
import { useExpenses } from '../hooks/useExpenses'
import { useAuth } from '../hooks/useAuth'
import { calculateBalances, simplifyDebts, formatCurrency, getInitials } from '../utils/helpers'
import { groupsAPI, expensesAPI, usersAPI } from '../utils/api'

const GROUP_TABS = [
  { id: 'expenses', label: '💸 Expenses' },
  { id: 'balances', label: '⚖️ Balances' },
  { id: 'settle',   label: '🤝 Settle Up' },
  { id: 'members',  label: '👥 Members' },
]

// ── Add Member Modal ───────────────────────────────────────
function AddMemberModal({ group, onClose, onAdded }) {
  const [email, setEmail]         = useState('')
  const [result, setResult]       = useState(null)
  const [searching, setSearching] = useState(false)
  const [adding, setAdding]       = useState(false)

  const handleSearch = async () => {
    const q = email.trim().toLowerCase()
    if (!q) return
    setSearching(true); setResult(null)
    try {
      const { data } = await usersAPI.search(q)
      const found = data[0]
      if (!found) { toast.error('No user found with that email'); return }
      if (group.members.some(m => m._id === found._id)) { toast.error('Already a member'); return }
      setResult(found)
    } catch { toast.error('Search failed') }
    finally { setSearching(false) }
  }

  const handleAdd = async () => {
    if (!result) return
    setAdding(true)
    try {
      const { data } = await groupsAPI.addMember(group._id, result.email)
      onAdded(data)
      toast.success(`${result.name} added!`)
      onClose()
    } catch (e) { toast.error(typeof e === 'string' ? e : 'Failed to add member') }
    finally { setAdding(false) }
  }

  return (
    <Modal title="Add Member" onClose={onClose} maxWidth={440}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ minWidth: 120 }} onClick={handleAdd} disabled={!result || adding}>
            {adding ? <span className="loading" /> : 'Add to Group'}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
        Enter the email address of a registered SplitEase user.
      </p>
      <div className="form-group">
        <label>Email Address</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="email" placeholder="friend@email.com" value={email}
            onChange={e => { setEmail(e.target.value); setResult(null) }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            autoFocus style={{ flex: 1 }} />
          <button className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={handleSearch} disabled={searching}>
            {searching ? <span className="loading" style={{ width: 14, height: 14 }} /> : 'Search'}
          </button>
        </div>
      </div>
      {result && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: 11, padding: '12px 14px' }}>
          <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, borderRadius: 10 }}>{getInitials(result.name)}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{result.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{result.email}</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--accent3)', fontWeight: 700 }}>✓ Found</div>
        </div>
      )}
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────
export default function GroupDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { groups, refetch: refetchGroups } = useGroups()
  const { expenses, loading: expLoading, addExpense, updateExpense, removeExpense } = useExpenses(id)

  const [tab, setTab]                     = useState('expenses')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteExpTarget, setDeleteExpTarget] = useState(null)
  const [deletingExp, setDeletingExp]     = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showInvite, setShowInvite]       = useState(false)
  const [settleTarget, setSettleTarget]   = useState(null)
  const [settledKeys, setSettledKeys]     = useState([])

  const [fetchedGroup, setFetchedGroup] = useState(null)
  const [groupLoading, setGroupLoading] = useState(false)
  const [groupError, setGroupError]     = useState(false)

  const cachedGroup = groups.find(g => g._id === id)

  useEffect(() => {
    if (cachedGroup) return
    setGroupLoading(true)
    groupsAPI.getById(id)
      .then(({ data }) => setFetchedGroup(data))
      .catch(() => setGroupError(true))
      .finally(() => setGroupLoading(false))
  }, [id, cachedGroup])

  const handleMemberAdded = (updated) => { setFetchedGroup(updated); refetchGroups() }

  const group = cachedGroup || fetchedGroup

  const balances = useMemo(() => {
    if (!group) return {}
    return calculateBalances(group.members || [], expenses)
  }, [group, expenses])

  const transactions = useMemo(() => {
    if (!group) return []
    return simplifyDebts(group.members || [], balances)
  }, [group, balances])

  const pendingTransactions = transactions.filter(
    t => !settledKeys.includes(`${t.from?._id}-${t.to?._id}-${t.amount}`)
  )

  const handleDeleteExpense = async () => {
    if (!deleteExpTarget) return
    setDeletingExp(true)
    try {
      await expensesAPI.delete(deleteExpTarget._id)
      removeExpense(deleteExpTarget._id)
      toast.success(`"${deleteExpTarget.title}" deleted`)
      setDeleteExpTarget(null)
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Failed to delete expense')
    } finally {
      setDeletingExp(false)
    }
  }

  if (groupLoading) return <div className="full-loading"><span className="loading" /></div>
  if (groupError || (!group && !groupLoading)) {
    return (
      <div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/groups')} style={{ marginBottom: 20 }}>← Back</button>
        <EmptyState icon="😕" title="Group not found" subtitle="This group doesn't exist or you're not a member" />
      </div>
    )
  }
  if (!group) return null

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 12 }} onClick={() => navigate('/groups')}>
            ← Back
          </button>
          <h1 className="page-title">{group.icon} {group.name}</h1>
          <p className="page-subtitle">
            {group.members?.length} member{group.members?.length !== 1 ? 's' : ''}
            {expenses.length > 0 && ` · ${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowInvite(true)}>🔗 Invite</button>
          <button className="btn btn-secondary" onClick={() => setShowAddMember(true)}>+ Member</button>
          <button className="btn btn-primary"   onClick={() => setShowAddExpense(true)}>+ Expense</button>
        </div>
      </div>

      {/* Member balance chips */}
      <div className="member-chips">
        {(group.members || []).map(m => {
          const bal = balances[m._id] || 0
          const color = bal > 0.01 ? 'var(--accent3)' : bal < -0.01 ? 'var(--accent2)' : 'var(--text2)'
          return (
            <div key={m._id} className="member-chip">
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, borderRadius: 8 }}>
                {getInitials(m.name)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>{m.name?.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 600 }}>
                  {bal > 0.01 ? `+${formatCurrency(bal)}` : bal < -0.01 ? `-${formatCurrency(-bal)}` : 'settled'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Tabs tabs={GROUP_TABS} active={tab} onChange={setTab} />

      {/* Expenses Tab */}
      {tab === 'expenses' && (
        expLoading ? (
          <div className="full-loading"><span className="loading" /></div>
        ) : expenses.length === 0 ? (
          <EmptyState icon="💸" title="No expenses yet" subtitle="Add the first expense to start tracking"
            action={<button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowAddExpense(true)}>Add Expense</button>} />
        ) : (
          <div className="expense-list">
            {expenses.map(exp => (
              <ExpenseItem
                key={exp._id} expense={exp} currentUserId={user._id}
                onEdit={setEditingExpense}
                onDelete={setDeleteExpTarget}
              />
            ))}
          </div>
        )
      )}

      {/* Balances Tab */}
      {tab === 'balances' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Current Balances</h3>
          {(group.members || []).map(m => (
            <MemberBalanceBar key={m._id} member={m} balance={balances[m._id] || 0} />
          ))}
        </div>
      )}

      {/* Settle Tab */}
      {tab === 'settle' && (
        pendingTransactions.length === 0 ? (
          <EmptyState icon="🎉" title="All settled up!" subtitle="No outstanding balances in this group" />
        ) : (
          <div className="balance-list">
            {pendingTransactions.map((t, i) => (
              <TransactionRow key={i} transaction={t} currentUserId={user._id} onSettle={setSettleTarget} />
            ))}
          </div>
        )
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Members ({group.members?.length})</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowInvite(true)}>🔗 Invite</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddMember(true)}>+ Add</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(group.members || []).map(m => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--surface2)' }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, borderRadius: 10 }}>{getInitials(m.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{m.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {(group.creator?._id === m._id || group.creator === m._id) && <span className="badge badge-accent">Creator</span>}
                  {m._id === user._id && <span className="badge badge-green">You</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseModal group={group} onClose={() => setShowAddExpense(false)} onAdded={addExpense} />
      )}
      {editingExpense && (
        <AddExpenseModal group={group} initialExpense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onAdded={(u) => { updateExpense(u); setEditingExpense(null) }} />
      )}
      {deleteExpTarget && (
        <ConfirmModal
          icon="🗑️"
          title={`Delete "${deleteExpTarget.title}"?`}
          message="This expense will be permanently removed and balances will be recalculated."
          confirmLabel="Delete Expense" confirmClass="btn-danger"
          loading={deletingExp}
          onConfirm={handleDeleteExpense}
          onClose={() => setDeleteExpTarget(null)}
        />
      )}
      {showAddMember && (
        <AddMemberModal group={group} onClose={() => setShowAddMember(false)} onAdded={handleMemberAdded} />
      )}
      {showInvite && (
        <InviteModal group={group} onClose={() => setShowInvite(false)} />
      )}
      {settleTarget && (
        <SettleModal transaction={settleTarget} groupId={id}
          onClose={() => setSettleTarget(null)}
          onSettled={t => setSettledKeys(p => [...p, `${t.from?._id}-${t.to?._id}-${t.amount}`])} />
      )}
    </div>
  )
}
