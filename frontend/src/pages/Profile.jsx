import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  GraduationCap,
  BookOpen,
} from 'lucide-react'

export default function Profile() {
  const { user, role, setUser } = useAuth()

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    qualification: '',
    specialization: '',
    experience_years: 0,
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password Change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.instructor_profile?.bio || '',
        qualification: user.instructor_profile?.qualification || '',
        specialization: user.instructor_profile?.specialization || '',
        experience_years: user.instructor_profile?.experience_years || 0,
      })
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      setSavingProfile(true)
      setProfileError('')
      setProfileSuccess('')

      const payload = {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone || null,
      }

      if (role === 'instructor') {
        payload.instructor_profile = {
          bio: profileForm.bio,
          qualification: profileForm.qualification,
          specialization: profileForm.specialization,
          experience_years: parseInt(profileForm.experience_years) || 0,
        }
      }

      const res = await api.put(`/users/${user.id}`, payload)
      if (setUser) {
        setUser(res.data)
      }
      setProfileSuccess('Profile information updated successfully!')
      setTimeout(() => setProfileSuccess(''), 4000)
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }

    try {
      setChangingPassword(true)
      setPasswordError('')
      setPasswordSuccess('')

      await api.post('/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })

      setPasswordSuccess('Your password has been changed successfully!')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setTimeout(() => setPasswordSuccess(''), 4000)
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password.')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Account & Profile Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your personal information, security credentials, and academic preferences.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md shrink-0">
          {user?.first_name ? user.first_name[0] : 'U'}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              {user?.first_name} {user?.last_name}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
              {role === 'admin' && <Shield size={12} />}
              {role === 'instructor' && <BookOpen size={12} />}
              {role === 'student' && <GraduationCap size={12} />}
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <div className="text-xs text-slate-400">
            Account ID: #{user?.id} • Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserIcon size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
          </div>

          {profileError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email (Immutable)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91..."
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Instructor Specific Fields */}
            {role === 'instructor' && (
              <>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      placeholder="e.g. M.Tech, Ph.D"
                      value={profileForm.qualification}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, qualification: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      value={profileForm.experience_years}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, experience_years: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Full-Stack Web Development, Data Science"
                    value={profileForm.specialization}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, specialization: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bio / Profile Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Brief background about your academic and industry experience..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save size={14} />
                {savingProfile ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <KeyRound size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Security & Password</h3>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current_password: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, new_password: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Lock size={14} />
                {changingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
