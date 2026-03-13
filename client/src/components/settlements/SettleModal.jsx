import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import { settlementsAPI } from '../../utils/api'
import { PAYMENT_METHODS } from '../../utils/constants'
import { formatCurrency } from '../../utils/helpers'

export default function SettleModal({ transaction, groupId, onClose, onSettled }) {
  const [method, setMethod] = useState('cash')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSettle = async () => {
    setLoading(true)
    try {
      await settlementsAPI.create({
        receiverId: transaction.to._id,
        amount: transaction.amount,
        groupId,
        method,
        note,
      })
      onSettled(transaction)
      toast.success(`Settlement of ${formatCurrency(transaction.amount)} recorded!`)
      onClose()
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Settle Payment"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-success"
            style={{ width: 'auto', minWidth: 140 }}
            onClick={handleSettle}
            disabled={loading}
          >
            {loading ? <span className="loading" /> : '✓ Mark Settled'}
          </button>
        </>
      }
    >
      {/* Amount Summary */}
      <div style={{
        textAlign: 'center', padding: '22px 16px',
        background: 'var(--surface2)', borderRadius: 14, marginBottom: 22,
      }}>
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 10 }}>
          <strong style={{ color: 'var(--text)' }}>{transaction.from?.name}</strong>
          <span style={{ margin: '0 8px', color: 'var(--text2)' }}>pays</span>
          <strong style={{ color: 'var(--text)' }}>{transaction.to?.name}</strong>
        </div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 42, fontWeight: 800, color: 'var(--accent3)' }}>
          {formatCurrency(transaction.amount)}
        </div>
      </div>

      {/* Payment Method */}
      <div className="form-group">
        <label>Payment Method</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {PAYMENT_METHODS.map(m => (
            <div
              key={m.id}
              className={`split-btn${method === m.id ? ' active' : ''}`}
              onClick={() => setMethod(m.id)}
            >
              <span className="split-icon">{m.icon}</span>
              {m.label}
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="form-group">
        <label>Note (optional)</label>
        <input
          type="text"
          placeholder="Transaction ID, reference…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>
    </Modal>
  )
}
