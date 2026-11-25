import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 text-sm font-medium">Authenticating session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to respective dashboard if role not permitted
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'instructor') return <Navigate to="/instructor" replace />
    return <Navigate to="/student" replace />
  }

  return <Outlet />
}
