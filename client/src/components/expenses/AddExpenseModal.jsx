import React, { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import { expensesAPI } from '../../utils/api'
import { CATEGORY_CONFIG } from '../../utils/constants'
import { getInitials, formatCurrency } from '../../utils/helpers'
import { useAuth } from '../../hooks/useAuth'

function round2(n) { return Math.round(n * 100) / 100 }

// ── Two split modes ──────────────────────────────────────────
// "equal"   → pick who's included, split evenly
// "custom"  → pick who's included, enter exact amount for each

const SPLIT_MODES = [
  {
    id: 'equal',
    icon: '⚖️',
    title: 'Split Equally',
    desc: 'Select who\'s included — divided evenly',
  },
  {
    id: 'custom',
    icon: '✏️',
    title: 'Custom Amounts',
    desc: 'Select who\'s included — enter each person\'s share',
  },
]

export default function AddExpenseModal({ group, onClose, onAdded, initialExpense = null }) {
  const { user } = useAuth()
  const isEdit = !!initialExpense

  // normalise splitMethod: old 'unequal'/'percentage'/'shares' → 'custom'
  const normMethod = (m) =>
    m === 'equal' ? 'equal' : 'custom'

  const [form, setForm] = useState({
    title:       initialExpense?.title || '',
    amount:      initialExpense?.amount?.toString() || '',
    category:    initialExpense?.category || 'food',
    description: initialExpense?.description || '',
    paidBy:      initialExpense?.paidBy?._id || initialExpense?.paidBy || user._id,
    splitMethod: normMethod(initialExpense?.splitMethod || 'equal'),
    date:        initialExpense?.date
                   ? new Date(initialExpense.date).toISOString().split('T')[0]
                   : new Date().toISOString().split('T')[0],
  })

  const [participants, setParticipants] = useState(() => {
    const existingMap = {}
    if (initialExpense) {
      ;(initialExpense.participants || []).forEach(p => {
        const id = p.user?._id || p.user
        existingMap[id] = p.shareAmount
      })
    }
    return (group.members || []).map(m => ({
      ...m,
      selected:    initialExpense ? (m._id in existingMap) : true,
      shareAmount: existingMap[m._id] || '',
    }))
  })

  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  const toggle = (id) =>
    setParticipants(prev =>
      prev.map(p => p._id === id ? { ...p, selected: !p.selected } : p)
    )
  const setShare = (id, v) =>
    setParticipants(prev =>
      prev.map(p => p._id === id ? { ...p, shareAmount: v } : p)
    )

  const selected = participants.filter(p => p.selected)
  const amt = parseFloat(form.amount) || 0
  const equalShare = selected.length > 0 ? round2(amt / selected.length) : 0

  // Validation for custom mode
  const customTotal = useMemo(() => {
    if (form.splitMethod !== 'custom') return 0
    return round2(selected.reduce((s, p) => s + (parseFloat(p.shareAmount) || 0), 0))
  }, [form.splitMethod, selected, participants])

  const customDiff   = round2(amt - customTotal)
  const customIsOk   = amt > 0 && Math.abs(customDiff) < 0.01

  // Build final participant list for API
  const getComputedParticipants = () => {
    if (form.splitMethod === 'equal') {
      return selected.map(p => ({ user: p._id, shareAmount: equalShare }))
    }
    return selected.map(p => ({
      user: p._id,
      shareAmount: round2(parseFloat(p.shareAmount) || 0),
    }))
  }

  const handleSubmit = async () => {
    if (!form.title.trim())    { toast.error('Title is required'); return }
    if (!amt || amt <= 0)      { toast.error('Enter a valid amount'); return }
    if (selected.length === 0) { toast.error('Select at least one participant'); return }
    if (form.splitMethod === 'custom' && !customIsOk) {
      toast.error(customDiff > 0
        ? `₹${customDiff} still unallocated`
        : `₹${Math.abs(customDiff)} over the total`)
      return
    }

    setLoading(true)
    try {
      const payload = {
        title:        form.title.trim(),
        amount:       amt,
        paidBy:       form.paidBy,
        groupId:      group._id,
        participants: getComputedParticipants(),
        splitMethod:  form.splitMethod === 'custom' ? 'unequal' : 'equal',
        category:     form.category,
        description:  form.description,
        date:         form.date,
      }
      const { data } = isEdit
        ? await expensesAPI.update(initialExpense._id, payload)
        : await expensesAPI.create(payload)
      onAdded(data)
      toast.success(isEdit ? `"${form.title}" updated!` : `"${form.title}" added!`)
      onClose()
    } catch (e) {
      toast.error(typeof e === 'string' ? e : `Failed to ${isEdit ? 'update' : 'add'} expense`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit Expense' : 'Add Expense'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ minWidth: 130 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="loading" /> : isEdit ? 'Save Changes' : 'Add Expense'}
          </button>
        </>
      }
    >
      {/* ── Title ── */}
      <div className="form-group">
        <label>Expense Title</label>
        <input
          type="text"
          placeholder="Dinner, Hotel, Tickets…"
          value={form.title}
          onChange={set('title')}
          autoFocus
        />
      </div>

      {/* ── Amount + Category ── */}
      <div className="form-grid-2">
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={set('amount')}
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={set('category')}>
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Paid By + Date ── */}
      <div className="form-grid-2">
        <div className="form-group">
          <label>Paid By</label>
          <select value={form.paidBy} onChange={set('paidBy')}>
            {(group.members || []).map(m => (
              <option key={m._id} value={m._id}>
                {m._id === user._id ? `${m.name} (you)` : m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={form.date} onChange={set('date')} />
        </div>
      </div>

      {/* ── Split Method — 2 card options ── */}
      <div className="form-group">
        <label>How to Split</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {SPLIT_MODES.map(mode => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, splitMethod: mode.id }))}
              style={{
                background: form.splitMethod === mode.id
                  ? 'rgba(108,99,255,0.12)'
                  : 'var(--surface2)',
                border: `1.5px solid ${form.splitMethod === mode.id ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '14px 12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{mode.icon}</div>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: form.splitMethod === mode.id ? 'var(--accent)' : 'var(--text)',
                marginBottom: 3,
              }}>
                {mode.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>
                {mode.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Participants ── */}
      <div className="form-group">
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 8,
        }}>
          <label style={{ marginBottom: 0 }}>
            Who's Included
            <span style={{
              marginLeft: 8, fontSize: 11,
              color: 'var(--accent)', fontWeight: 600,
              background: 'rgba(108,99,255,0.12)',
              padding: '2px 8px', borderRadius: 20,
            }}>
              {selected.length} of {participants.length}
            </span>
          </label>
          {form.splitMethod === 'equal' && amt > 0 && selected.length > 0 && (
            <span style={{
              fontSize: 12, color: 'var(--accent3)',
              fontWeight: 700, background: 'rgba(67,233,123,0.1)',
              padding: '3px 10px', borderRadius: 20,
            }}>
              {formatCurrency(equalShare)} each
            </span>
          )}
          {form.splitMethod === 'custom' && amt > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: customIsOk ? 'var(--accent3)' : 'var(--accent2)',
              background: customIsOk ? 'rgba(67,233,123,0.1)' : 'rgba(255,101,132,0.1)',
              padding: '3px 10px', borderRadius: 20,
            }}>
              {customIsOk
                ? '✓ Balanced'
                : customDiff > 0
                  ? `₹${customDiff} left`
                  : `₹${Math.abs(customDiff)} over`}
            </span>
          )}
        </div>

        {/* Participant cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {participants.map(p => (
            <div
              key={p._id}
              onClick={() => toggle(p._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 11,
                border: `1.5px solid ${p.selected ? 'var(--accent)' : 'var(--border)'}`,
                background: p.selected ? 'rgba(108,99,255,0.07)' : 'var(--surface2)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                userSelect: 'none',
              }}
            >
              {/* Checkbox indicator */}
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${p.selected ? 'var(--accent)' : 'var(--border)'}`,
                background: p.selected ? 'var(--accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {p.selected && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: p.selected
                  ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                  : 'var(--surface3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: p.selected ? '#fff' : 'var(--text2)',
                transition: 'all 0.15s',
              }}>
                {getInitials(p.name)}
              </div>

              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: p.selected ? 'var(--text)' : 'var(--text2)',
                }}>
                  {p.name}
                  {p._id === user._id && (
                    <span style={{
                      marginLeft: 6, fontSize: 10, fontWeight: 700,
                      color: 'var(--accent)', background: 'rgba(108,99,255,0.12)',
                      padding: '1px 6px', borderRadius: 10,
                    }}>you</span>
                  )}
                </div>
              </div>

              {/* Right side — equal share label OR custom input */}
              {p.selected && (
                <div onClick={e => e.stopPropagation()}>
                  {form.splitMethod === 'equal' && amt > 0 ? (
                    <div style={{
                      fontSize: 14, fontWeight: 700,
                      color: 'var(--accent)', minWidth: 70, textAlign: 'right',
                    }}>
                      {formatCurrency(equalShare)}
                    </div>
                  ) : form.splitMethod === 'custom' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>₹</span>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        value={p.shareAmount}
                        onChange={e => setShare(p._id, e.target.value)}
                        style={{
                          width: 80, textAlign: 'right',
                          padding: '5px 8px', fontSize: 14, fontWeight: 700,
                          background: 'var(--surface)', border: '1.5px solid var(--border)',
                          borderRadius: 8, color: 'var(--text)',
                          outline: 'none', fontFamily: 'inherit',
                          transition: 'border-color 0.15s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {/* Not included label */}
              {!p.selected && (
                <div style={{ fontSize: 11, color: 'var(--text2)', fontStyle: 'italic' }}>
                  not included
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Description ── */}
      <div className="form-group">
        <label>Description (optional)</label>
        <textarea
          placeholder="Any notes…"
          value={form.description}
          onChange={set('description')}
          rows={2}
        />
      </div>
    </Modal>
  )
}
