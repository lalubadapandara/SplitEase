import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { authAPI } from '../../utils/api'

// Inline Google SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.2 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.6 1 24 1 14.9 1 7.2 6.4 3.6 14l7 5.4C12.4 13.1 17.8 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7C43.8 37.1 46.5 31.3 46.5 24.5z"/>
      <path fill="#FBBC05" d="M10.6 28.6C10.2 27.4 10 26.2 10 25s.2-2.4.6-3.5L3.6 16C2.1 19 1.2 22.4 1.2 25.9c0 3.6.9 6.9 2.4 9.9l7-5.4-.1-.8z"/>
      <path fill="#34A853" d="M24 48c5.4 0 9.9-1.8 13.2-4.8l-7.4-5.7c-1.8 1.2-4.1 1.9-5.8 1.9-6.2 0-11.5-4.2-13.4-9.8l-7 5.4C7.2 42 14.9 48 24 48z"/>
    </svg>
  )
}

export default function LoginForm() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, updateUser } = useAuth()
  const navigate = useNavigate()

  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Google One Tap / redirect flow using accounts.google.com
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      toast.error('Google login is not configured. Set VITE_GOOGLE_CLIENT_ID in .env')
      return
    }

    setGoogleLoading(true)

    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            // Decode the JWT credential to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]))
            const { data } = await authAPI.google({
              idToken: response.credential,
              name: payload.name,
              email: payload.email,
              googleId: payload.sub,
            })
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            updateUser(data.user)
            toast.success(`Welcome, ${data.user.name}!`)
            navigate('/dashboard')
          } catch {
            toast.error('Google sign-in failed. Please try again.')
          } finally {
            setGoogleLoading(false)
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: show popup
          window.google.accounts.id.renderButton(
            document.getElementById('google-btn-container'),
            { theme: 'outline', size: 'large', width: 380 }
          )
          setGoogleLoading(false)
        }
      })
    }
    script.onerror = () => {
      toast.error('Could not load Google sign-in')
      setGoogleLoading(false)
    }
    document.body.appendChild(script)
  }

  return (
    <div className="auth-form-side">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {/* Google Sign-In button */}
        <button
          type="button"
          className="btn btn-google"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{ marginBottom: 4 }}
        >
          {googleLoading ? <span className="loading" style={{ borderTopColor: '#4285F4' }} /> : <GoogleIcon />}
          Continue with Google
        </button>

        {/* Hidden fallback container for Google button */}
        <div id="google-btn-container" style={{ display: 'none', marginBottom: 8 }} />

        <div className="auth-divider">or sign in with email</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={set('email')}
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="loading" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-toggle">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
