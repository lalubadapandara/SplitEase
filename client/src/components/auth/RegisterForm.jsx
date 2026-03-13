import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.name.trim()) { toast.error('Please enter your full name'); return }
    if (!form.email) { toast.error('Please enter your email'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      toast.success('Account created! Welcome to SplitEase.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-side">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join SplitEase and start splitting expenses effortlessly</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={set('name')}
              autoFocus
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="loading" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
