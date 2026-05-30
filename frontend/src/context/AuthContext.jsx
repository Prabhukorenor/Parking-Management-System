import { useEffect, useState } from 'react'
import * as authService from '../services/authService'
import { AuthContext } from './authContext'

function getStoredUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const handleAuthResponse = (response) => {
    setToken(response.token)
    setUser(response.user)
    return response
  }

  const login = async (payload) => handleAuthResponse(await authService.login(payload))
  const register = async (payload) => authService.register(payload)

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
