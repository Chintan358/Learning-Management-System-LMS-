import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lms_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('lms_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verify token validity on load
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data)
          localStorage.setItem('lms_user', JSON.stringify(res.data))
        })
        .catch(() => {
          logout()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, user: userData } = res.data
    localStorage.setItem('lms_token', access_token)
    localStorage.setItem('lms_user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
    return userData
  }

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData)
    const { access_token, user: userData } = res.data
    localStorage.setItem('lms_token', access_token)
    localStorage.setItem('lms_user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedData) => {
    setUser(updatedData)
    localStorage.setItem('lms_user', JSON.stringify(updatedData))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role?.name || null,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
