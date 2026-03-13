import React from 'react'
import AuthBrand from '../components/auth/AuthBrand'
import LoginForm from '../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <AuthBrand />
      <LoginForm />
    </div>
  )
}
