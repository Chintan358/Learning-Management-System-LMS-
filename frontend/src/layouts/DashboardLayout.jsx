import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileCheck,
  Award,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  BarChart3,
  Search,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react'

export default function DashboardLayout() {
  const { user, role, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  // Fetch notifications
  useEffect(() => {
    if (user) {
      api
        .get('/notifications?unread_only=false')
        .then((res) => setNotifications(res.data))
        .catch(() => {})
    }
  }, [user, location.pathname])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (e) {}
  }

  // Navigation Links based on role
  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Users & Staff', path: '/admin/users', icon: Users },
          { name: 'Courses', path: '/courses', icon: BookOpen },
          { name: 'Batches', path: '/batches', icon: Calendar },
          { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
          { name: 'All Payments', path: '/payments', icon: CreditCard },
        ]
      case 'instructor':
        return [
          { name: 'Dashboard', path: '/instructor', icon: LayoutDashboard },
          { name: 'My Batches', path: '/batches', icon: Calendar },
          { name: 'Course Syllabus', path: '/courses', icon: BookOpen },
          { name: 'Assignments', path: '/assignments', icon: FileCheck },
          { name: 'Quizzes', path: '/quizzes', icon: HelpCircle },
          { name: 'Attendance', path: '/attendance', icon: CheckCircle2 },
        ]
      case 'student':
      default:
        return [
          { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
          { name: 'My Courses', path: '/courses', icon: BookOpen },
          { name: 'Assignments', path: '/assignments', icon: FileCheck },
          { name: 'Quizzes', path: '/quizzes', icon: HelpCircle },
          { name: 'Attendance', path: '/attendance', icon: CheckCircle2 },
          { name: 'Tuition & Fees', path: '/payments', icon: CreditCard },
          { name: 'Certificates', path: '/certificates', icon: Award },
        ]
    }
  }

  const navLinks = getNavLinks()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              LMS
            </div>
            <span className="font-semibold text-slate-900 text-base">Institute LMS</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Unread Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Branding */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white font-bold flex items-center justify-center text-base shadow-sm">
                LMS
              </div>
              <div>
                <div className="font-bold text-slate-900 leading-tight">Institute Portal</div>
                <div className="text-[11px] text-slate-400 capitalize font-medium">{role} Workspace</div>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive =
                item.path === location.pathname ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer User Profile & Verification Links */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <Link
            to="/verify-certificate"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-200 transition-colors"
          >
            <Award size={14} />
            Public Certificate Verify
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Link to="/profile" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs shrink-0">
                {user?.first_name ? user.first_name[0] : 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {role} Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    <span className="text-xs text-indigo-600 font-medium">
                      {unreadCount} Unread
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.is_read) markAsRead(n.id)
                            if (n.action_url) navigate(n.action_url)
                            setShowNotifications(false)
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer text-left transition-colors ${
                            !n.is_read ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs shadow-xs">
                {user?.first_name ? user.first_name[0] : 'U'}
              </div>
              <div className="text-left text-xs font-medium text-slate-800">
                {user?.first_name} {user?.last_name}
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
