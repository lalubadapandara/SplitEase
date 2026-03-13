import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { getInitials } from '../../utils/helpers'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/groups',    icon: '👥', label: 'Groups' },
  { to: '/expenses',  icon: '💸', label: 'All Expenses' },
  { to: '/profile',   icon: '👤', label: 'Profile' },
]

export default function Sidebar({ user, isOpen, onClose }) {
  const { logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className={`sidebar${isOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-logo">SplitEase</div>

      <nav className="sidebar-section">
        <div className="sidebar-label">Menu</div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to} to={item.to} onClick={onClose}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Theme toggle */}
        <div className="sidebar-theme-row">
          <span className="sidebar-theme-label">Appearance</span>
          <div className="theme-pill">
            <button
              className={`theme-pill-btn${theme === 'dark' ? ' active' : ''}`}
              onClick={() => theme !== 'dark' && toggle()}
              title="Dark"
            >🌙</button>
            <button
              className={`theme-pill-btn${theme === 'light' ? ' active' : ''}`}
              onClick={() => theme !== 'light' && toggle()}
              title="Light"
            >☀️</button>
          </div>
        </div>

        <NavLink to="/profile" className="user-info" onClick={onClose}>
          <div className="avatar">{getInitials(user?.name)}</div>
          <div style={{ minWidth: 0 }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </NavLink>
        <button
          className="btn btn-danger btn-sm"
          style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}
          onClick={handleLogout}
        >Sign Out</button>
      </div>
    </aside>
  )
}
