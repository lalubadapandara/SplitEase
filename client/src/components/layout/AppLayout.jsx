import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'

export default function AppLayout() {
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="app-layout">
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <span className="mobile-logo">SplitEase</span>
        <div className="mobile-topbar-right">
          {/* Theme toggle in topbar */}
          <button
            className="theme-toggle"
            onClick={toggle}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            className={`hamburger${sidebarOpen ? ' is-open' : ''}`}
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`sidebar-backdrop${sidebarOpen ? ' visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
