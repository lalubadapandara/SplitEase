import React from 'react'
import AuthBrand from '../components/auth/AuthBrand'
import RegisterForm from '../components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="auth-wrap">
      <AuthBrand />
      <RegisterForm />
    </div>
  )
}
