import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../ui/Modal'
import { groupsAPI, usersAPI } from '../../utils/api'
import { GROUP_ICONS } from '../../utils/constants'
import { getInitials } from '../../utils/helpers'
import { useAuth } from '../../hooks/useAuth'

export default function CreateGroupModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏠')
  const [emailInput, setEmailInput] = useState('')
  const [members, setMembers] = useState([user])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)

  const addMember = async () => {
    const email = emailInput.trim().toLowerCase()
    if (!email) return
    if (members.find(m => m.email?.toLowerCase() === email)) {
      toast.error('Already added')
      return
    }
    setSearching(true)
    try {
      const { data } = await usersAPI.search(email)
      const found = data[0]
      if (!found) {
        toast.error('No user found with that email')
        return
      }
      setMembers(prev => [...prev, found])
      setEmailInput('')
      toast.success(`${found.name} added`)
    } catch {
      toast.error('Could not search for user')
    } finally {
      setSearching(false)
    }
  }

  const removeMember = (id) => setMembers(prev => prev.filter(m => m._id !== id))

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Group name is required'); return }
    setLoading(true)
    try {
      const memberEmails = members
        .filter(m => m._id !== user._id && m.email)
        .map(m => m.email)
      const { data } = await groupsAPI.create({ name: name.trim(), icon, memberEmails })
      onCreated(data)
      toast.success(`"${data.name}" created!`)
      onClose()
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Create Group"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', minWidth: 140 }}
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? <span className="loading" /> : 'Create Group'}
          </button>
        </>
      }
    >
      {/* Group Name */}
      <div className="form-group">
        <label>Group Name</label>
        <input
          type="text"
          placeholder="e.g. Goa Trip, Flatmates…"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          autoFocus
        />
      </div>

      {/* Icon Picker */}
      <div className="form-group">
        <label>Group Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GROUP_ICONS.map(ic => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              style={{
                width: 42, height: 42, fontSize: 22, borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: icon === ic ? 'rgba(108,99,255,0.2)' : 'var(--surface2)',
                border: `1.5px solid ${icon === ic ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Add Members */}
      <div className="form-group">
        <label>Add Members by Email (optional)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            placeholder="Enter email address"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMember()}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-secondary"
            style={{ flexShrink: 0 }}
            onClick={addMember}
            disabled={searching}
          >
            {searching ? <span className="loading" style={{ width: 14, height: 14 }} /> : 'Add'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
          The user must already be registered on SplitEase
        </p>
      </div>

      {/* Members List */}
      {members.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Members ({members.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {members.map(m => (
              <div key={m._id} className="chip">
                <div className="avatar" style={{ width: 22, height: 22, fontSize: 9, borderRadius: 6, flexShrink: 0 }}>
                  {getInitials(m.name)}
                </div>
                <span>{m.name?.split(' ')[0] || m.email}</span>
                {m._id !== user._id && (
                  <button className="chip-remove" onClick={() => removeMember(m._id)} aria-label="Remove">×</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
