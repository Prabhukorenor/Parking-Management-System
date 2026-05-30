import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.jsx'
import { resolveAssetUrl } from '../../services/api'
import logo from '../../assets/logo2.png'
import { CalendarCheck, LogOut, UserCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import './Navbar.css'

const roleHome = {
  CUSTOMER: '/customer/home',
  OWNER: '/owner/add-parking',
  ADMIN: '/admin/analytics',
}

const roleProfile = {
  CUSTOMER: '/customer/profile',
  OWNER: '/owner/profile',
  ADMIN: '/admin/profile',
}

const roleBookings = {
  CUSTOMER: '/customer/bookings',
  OWNER: '/owner/bookings',
}

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const profileImageUrl = user?.profileImage ? resolveAssetUrl(user.profileImage) : null

  // Check if on admin dashboard
  const isAdminDashboard = user?.role === 'ADMIN' && location.pathname.startsWith('/admin')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const closeDropdown = () => setDropdownOpen(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink className="navbar__brand" to="/">
          <span className="navbar__brand-mark">
            <img src={logo} alt="ParkEase logo" />
          </span>
        </NavLink>

        <nav className="navbar__links">
          {!isAdminDashboard && <NavLink to="/home">Home</NavLink>}
          {!isAdminDashboard && <NavLink to="/about">About</NavLink>}
          {!isAdminDashboard && <NavLink to="/contact">Contact</NavLink>}
        </nav>

        <div className="navbar__actions">
          {isAuthenticated && user ? (
            <>
              <NavLink className="navbar__dashboard-link" to={roleHome[user.role]}>Dashboard</NavLink>
              <div className="navbar__profile" ref={dropdownRef}>
              <button 
                className="navbar__profile-trigger" 
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="navbar__avatar">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="navbar__avatar-image" />
                  ) : (
                    initials || <UserCircle size={20} />
                  )}
                </span>
                <span className="navbar__user">
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </span>
              </button>
              {dropdownOpen && (
                <div className="navbar__dropdown" style={{ opacity: 1, transform: 'translateY(0)', pointerEvents: 'auto' }}>
                  {user.role !== 'ADMIN' && (
                    <NavLink to={roleProfile[user.role]} onClick={closeDropdown}>
                      <UserCircle size={16} />
                      My Profile
                    </NavLink>
                  )}
                  {user.role !== 'ADMIN' && (
                    <NavLink to={roleBookings[user.role]} onClick={closeDropdown}>
                      <CalendarCheck size={16} />
                      My Bookings
                    </NavLink>
                  )}
                  <button type="button" onClick={() => {
                    closeDropdown()
                    handleLogout()
                  }}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
              </div>
            </>
          ) : (
            <>
              <NavLink className="navbar__auth" to="/login">
                Login
              </NavLink>
              <NavLink className="btn navbar__signup" to="/register">
                 <UserCircle size={20} strokeWidth={2.5} />
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
