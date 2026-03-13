import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { useAuth } from './hooks/useAuth'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import GroupsPage from './pages/GroupsPage'
import GroupDetailPage from './pages/GroupDetailPage'
import ExpensesPage from './pages/ExpensesPage'
import ProfilePage from './pages/ProfilePage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="full-loading"><span className="loading" /></div>
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

function ToasterWithTheme() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: isDark ? '#1a1a26' : '#ffffff',
          color: isDark ? '#f0f0f8' : '#1a1a26',
          border: `1px solid ${isDark ? '#2a2a3a' : '#e0e0f0'}`,
          borderRadius: '12px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.5)'
            : '0 8px 32px rgba(0,0,0,0.12)',
        },
        success: { iconTheme: { primary: '#43e97b', secondary: isDark ? '#1a1a26' : '#fff' } },
        error:   { iconTheme: { primary: '#ff6584', secondary: isDark ? '#1a1a26' : '#fff' } },
      }}
    />
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="groups"    element={<GroupsPage />} />
        <Route path="groups/:id" element={<GroupDetailPage />} />
        <Route path="expenses"  element={<ExpensesPage />} />
        <Route path="profile"   element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <ToasterWithTheme />
      </AuthProvider>
    </ThemeProvider>
  )
}
