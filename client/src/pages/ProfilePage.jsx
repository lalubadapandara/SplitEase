import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Avatar from '../components/ui/Avatar'
import { useAuth } from '../hooks/useAuth'
import { useExpenses } from '../hooks/useExpenses'
import { useGroups } from '../hooks/useGroups'
import { usersAPI } from '../utils/api'
import { formatCurrency } from '../utils/helpers'

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const { expenses } = useExpenses()
  const { groups } = useGroups()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const totalAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0)

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return }
    setLoading(true)
    try {
      const { data } = await usersAPI.updateMe({ name: form.name.trim(), phone: form.phone })
      updateUser(data)
      toast.success('Profile updated!')
      setEditing(false)
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const stats = [
    { label: 'Groups',   val: groups.length },
    { label: 'Expenses', val: expenses.length },
    { label: 'Total Spent', val: formatCurrency(totalAmount) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left — Identity card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Avatar name={user?.name} size="lg" />
          </div>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            {user?.name}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, wordBreak: 'break-word', marginBottom: 20 }}>
            {user?.email}
          </div>

          <hr className="divider" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, wordBreak: 'break-all' }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Edit panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Personal Information</h3>
              {!editing && (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                disabled={!editing}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user?.email || ''} disabled />
            </div>
            <div className="form-group" style={{ marginBottom: editing ? 18 : 0 }}>
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={form.phone}
                onChange={set('phone')}
                disabled={!editing}
              />
            </div>

            {editing && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setEditing(false); setForm({ name: user?.name || '', phone: user?.phone || '' }) }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? <span className="loading" /> : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>Account</h3>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>
              Signing out will end your current session. Your data will remain saved.
            </p>
            <button className="btn btn-danger btn-full" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
