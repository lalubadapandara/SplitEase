import React from 'react'
import Modal from './Modal'

export default function ConfirmModal({
  icon = '⚠️',
  title,
  message,
  confirmLabel = 'Delete',
  confirmClass = 'btn-danger',
  onConfirm,
  onClose,
  loading = false,
}) {
  return (
    <Modal title="" onClose={onClose} maxWidth={400}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={`btn ${confirmClass}`} style={{ minWidth: 110 }} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="loading" /> : confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-dialog">
        <span className="confirm-dialog-icon">{icon}</span>
        <div className="confirm-dialog-title">{title}</div>
        <p className="confirm-dialog-message">{message}</p>
      </div>
    </Modal>
  )
}
