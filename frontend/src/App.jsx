import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

// Page Imports
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import StudentDashboard from './pages/StudentDashboard'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Batches from './pages/Batches'
import LecturePlayer from './pages/LecturePlayer'
import Assignments from './pages/Assignments'
import Quizzes from './pages/Quizzes'
import Attendance from './pages/Attendance'
import Payments from './pages/Payments'
import Certificates from './pages/Certificates'
import PublicVerifyCertificate from './pages/PublicVerifyCertificate'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Profile from './pages/Profile'

function RootRedirect() {
  const { role, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 text-sm font-medium">Loading session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role === 'admin') return <Navigate to="/admin" replace />
  if (role === 'instructor') return <Navigate to="/instructor" replace />
  return <Navigate to="/student" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-certificate/:code?" element={<PublicVerifyCertificate />} />

          {/* Root Portal Redirection */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authenticated Application with Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Role-Specific Dashboards */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/instructor"
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared Academic & Administrative Modules */}
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/courses/:courseId/lectures/:lectureId?" element={<LecturePlayer />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* 404 Catch-All Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
