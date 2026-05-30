import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { roles } from '../constants/options'
import { useAuth } from '../context/useAuth.jsx'
import { getApiErrorMessage } from '../utils/formatters'
import './RegisterPage.css'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      toast.error('Passwords do not match.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      // Only send required fields to backend
      const registrationData = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }

      await register(registrationData)

      toast.success('Account created successfully. Please login.')

      setTimeout(() => {
        navigate('/login', { replace: true, state: { email: form.email } })
      }, 1300)
    } catch (registerError) {
      setError(getApiErrorMessage(registerError, 'Registration failed.'))
      toast.error('Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="registerpage">
      <div className="page-shell auth-page">
        <form className="auth-card section-card" onSubmit={handleSubmit}>
          <div>
            <p className="auth-card__eyebrow">Create account</p>
            <h1>Register</h1>
            <p className="muted">Choose customer or owner, then login to continue.</p>
          </div>

          {error && <div className="message message-error">{error}</div>}

          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </div>

            <div className="password-row">
              <div className="field-group password-field">
                <label htmlFor="register-password">Password</label>

                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onFocus={() =>
                    toast.info('Password must be 6+ characters with letters & numbers', {
                      toastId: 'password-hint',
                    })
                  }
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

              <div className="field-group password-field">
                <label htmlFor="confirm-password">Confirm Password</label>

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                />

                <span
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div className="role-field">
              <div className="field-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value }))
                  }
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>

          <p className="muted">
            Already registered?{' '}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
