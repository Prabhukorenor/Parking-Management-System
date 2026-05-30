
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import { getApiErrorMessage } from '../utils/formatters'
import './LoginPage.css'
import { FiEye, FiEyeOff } from "react-icons/fi";

import ForgotPasswordModal from '../pages/ForgotPasswordModal';

// ✅ TOAST
import { toast } from "react-toastify";

const roleTargets = {
  CUSTOMER: '/customer/home',
  OWNER: '/owner/add-parking',
  ADMIN: '/admin/analytics',
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showForgot, setShowForgot] = useState(false);

  // ✅ NEW (for eye toggle)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setError('')

      const response = await login(form)
      // toast.success("Login successful 🎉")
      toast.success(`Welcome ${response.user.name} 👋`)

      setTimeout(() => {
        navigate(
          location.state?.from || roleTargets[response.user.role] || '/',
          { replace: true }
        )
      }, 1600)
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, 'Login failed.'))

      // ✅ ERROR TOAST
      toast.error("Invalid email or password.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='loginpage'>
      <div className="page-shell auth-page">
        <form className="auth-card section-card" onSubmit={handleSubmit}>

          <div>
            <p className="auth-card__eyebrow">Welcome back</p>
            <h1>Login</h1>
          </div>

          {/* {error && <div className="message message-error">{error}</div>} */}

          {/* EMAIL */}
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>

          {/* PASSWORD WITH EYE */}
          <div className="field-group password-field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>

          <span className="forgot-link" onClick={() => setShowForgot(true)}>
            Forgot Password?
          </span>

          <p className="muted">
            Don't have an account? <Link to="/register" className='auth-link'>Register here</Link>
          </p>

        </form>
        {/* Forgot password*/}
        {showForgot && (
          <ForgotPasswordModal onClose={() => setShowForgot(false)} />
        )}
      </div>
    </div>
  )
}

export default LoginPage