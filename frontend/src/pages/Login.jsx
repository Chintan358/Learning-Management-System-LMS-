import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()

  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const from = location.state?.from?.pathname || '/'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role.name === 'admin') navigate('/admin')
      else if (user.role.name === 'instructor') navigate('/instructor')
      else navigate('/student')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
        role: 'student',
      })
      navigate('/student')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check inputs.')
    } finally {
      setLoading(false)
    }
  }

  // Quick fill helper for review & demonstration
  const quickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setIsRegister(false)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-slate-200">
        {/* Left Side: Branding & Info */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 p-8 sm:p-12 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/20">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Enterprise LMS</h1>
            <p className="text-indigo-100 text-sm leading-relaxed mb-8">
              A unified educational operations platform for institute administrators, faculty instructors, and students.
            </p>

            {/* Feature checklist */}
            <div className="space-y-3 text-xs text-indigo-100">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Role-Based Permissions (Admin, Faculty, Student)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Razorpay Integrated Tuition Fee Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Cloudinary Cloud Media & Lecture Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Cryptographic PDF Certificate Verification</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Fill Pills */}
          <div className="mt-8 pt-6 border-t border-indigo-500/30">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-indigo-200 mb-2.5">
              Quick Test Accounts:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => quickFill('admin@lms.edu', 'Admin@Secure2026!')}
                className="px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickFill('instructor@lms.edu', 'Instructor@Secure2026!')}
                className="px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-colors"
              >
                Instructor
              </button>
              <button
                type="button"
                onClick={() => quickFill('student@lms.edu', 'Student@Secure2026!')}
                className="px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-colors"
              >
                Student
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {isRegister ? 'Create Student Account' : 'Welcome Back'}
            </h2>
            <button
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
            >
              {isRegister ? 'Sign In Instead' : 'Register as Student'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">First Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors mt-6 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegister ? 'Complete Registration' : 'Sign In to Portal'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
