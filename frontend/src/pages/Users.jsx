import React, { useState, useEffect } from 'react'
import api from '../services/api'
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Shield,
  GraduationCap,
  BookOpen,
  X,
  Lock,
} from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    role_name: 'student',
  })
  const [submitting, setSubmitting] = useState(false)

  // Edit User Modal state
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    is_active: true,
  })

  // Delete Confirmation state
  const [deletingUser, setDeletingUser] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) {
      setError('Failed to load user directory.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError('')
      setSuccessMsg('')
      await api.post('/users', createForm)
      setSuccessMsg(`User ${createForm.email} registered successfully!`)
      setShowCreateModal(false)
      setCreateForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        role_name: 'student',
      })
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (u) => {
    setEditingUser(u)
    setEditForm({
      first_name: u.first_name,
      last_name: u.last_name,
      phone: u.phone || '',
      password: '',
      is_active: u.is_active,
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError('')
      const payload = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone: editForm.phone || null,
        is_active: editForm.is_active,
      }
      if (editForm.password) {
        payload.password = editForm.password
      }
      await api.put(`/users/${editingUser.id}`, payload)
      setSuccessMsg(`User #${editingUser.id} updated successfully!`)
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user profile.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (u) => {
    try {
      setError('')
      await api.put(`/users/${u.id}`, { is_active: !u.is_active })
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, is_active: !item.is_active } : item))
      )
    } catch (err) {
      setError('Failed to change user activation state.')
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    try {
      setError('')
      await api.delete(`/users/${deletingUser.id}`)
      setSuccessMsg(`User #${deletingUser.id} deactivated/deleted.`)
      setDeletingUser(null)
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user account.')
    }
  }

  // Filtered records
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)

    const matchesRole = selectedRole === 'all' || u.role?.name === selectedRole
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User & Staff Management</h1>
          <p className="text-sm text-slate-500">
            Provision academic credentials, assign roles (Admin, Instructor, Student), and manage account access.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <UserPlus size={16} />
          Provision New User
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Role:</span>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">
              Students ({users.filter((u) => u.role?.name === 'student').length})
            </option>
            <option value="instructor">
              Instructors ({users.filter((u) => u.role?.name === 'instructor').length})
            </option>
            <option value="admin">
              Admins ({users.filter((u) => u.role?.name === 'admin').length})
            </option>
          </select>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.first_name ? u.first_name[0] : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          u.role?.name === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role?.name === 'instructor'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role?.name === 'admin' && <Shield size={11} />}
                        {u.role?.name === 'instructor' && <BookOpen size={11} />}
                        {u.role?.name === 'student' && <GraduationCap size={11} />}
                        {u.role?.name}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{u.phone || '—'}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {u.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {u.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete / Deactivate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Provision User Account</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@lms.edu"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Type *</label>
                  <select
                    value={createForm.role_name}
                    onChange={(e) => setCreateForm({ ...createForm, role_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit User #{editingUser.id} ({editingUser.email})
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  placeholder="New password (optional)"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="edit-is-active" className="font-semibold text-slate-700">
                  Account is Active
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Deactivate User Account</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to deactivate or remove{' '}
              <strong>{deletingUser.first_name} {deletingUser.last_name}</strong> ({deletingUser.email})?
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs shadow-xs"
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
