import React, { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import ExpenseItem from '../components/expenses/ExpenseItem'
import ExpenseFilters from '../components/expenses/ExpenseFilters'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import ConfirmModal from '../components/ui/ConfirmModal'
import EmptyState from '../components/ui/EmptyState'
import { useExpenses } from '../hooks/useExpenses'
import { useGroups } from '../hooks/useGroups'
import { useAuth } from '../hooks/useAuth'
import { expensesAPI } from '../utils/api'

export default function ExpensesPage() {
  const { user }    = useAuth()
  const { expenses, loading, updateExpense, removeExpense } = useExpenses()
  const { groups }  = useGroups()

  const [search, setSearch]             = useState('')
  const [category, setCategory]         = useState('')
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return expenses.filter(e => {
      const matchSearch = !q || e.title.toLowerCase().includes(q) || e.group?.name?.toLowerCase().includes(q)
      const matchCat    = !category || e.category === category
      return matchSearch && matchCat
    })
  }, [expenses, search, category])

  const editingGroup = editingExpense
    ? groups.find(g => g._id === (editingExpense.group?._id || editingExpense.group))
    : null

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await expensesAPI.delete(deleteTarget._id)
      removeExpense(deleteTarget._id)
      toast.success(`"${deleteTarget.title}" deleted`)
      setDeleteTarget(null)
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Failed to delete expense')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Expenses</h1>
          <p className="page-subtitle">Your complete expense history</p>
        </div>
      </div>

      <ExpenseFilters search={search} onSearch={setSearch} category={category} onCategory={setCategory} />

      <div style={{ marginBottom: 14, color: 'var(--text2)', fontSize: 14 }}>
        {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
      </div>

      {loading ? (
        <div className="full-loading"><span className="loading" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No expenses found" subtitle="Try adjusting your search or filters" />
      ) : (
        <div className="expense-list">
          {filtered.map(exp => (
            <ExpenseItem
              key={exp._id}
              expense={exp}
              currentUserId={user._id}
              showGroup
              onEdit={setEditingExpense}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {editingExpense && editingGroup && (
        <AddExpenseModal
          group={editingGroup}
          initialExpense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onAdded={(updated) => { updateExpense(updated); setEditingExpense(null) }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          icon="🗑️"
          title={`Delete "${deleteTarget.title}"?`}
          message="This expense will be permanently removed and balances will be recalculated."
          confirmLabel="Delete Expense"
          confirmClass="btn-danger"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
