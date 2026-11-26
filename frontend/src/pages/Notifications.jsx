import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Bell, Megaphone, CheckCircle2, Circle, Calendar, Users, BookOpen, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function Notifications() {
  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const [notifications, setNotifications] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('notifications')

  // Create announcement (admin only)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', target_role: 'all', batch_id: '' })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/notifications?unread_only=false'),
      api.get('/notifications/announcements'),
    ])
      .then(([nRes, aRes]) => {
        setNotifications(nRes.data)
        setAnnouncements(aRes.data)
      })
      .catch(() => setError('Failed to load notifications.'))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch {}
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read)
    await Promise.all(unread.map((n) => api.put(`/notifications/${n.id}/read`).catch(() => {})))
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        content: form.content,
        target_role: form.target_role || null,
        batch_id: form.batch_id ? parseInt(form.batch_id) : null,
      }
      const res = await api.post('/notifications/announcements', payload)
      setAnnouncements((prev) => [res.data, ...prev])
      setForm({ title: '', content: '', target_role: 'all', batch_id: '' })
      setShowForm(false)
      setSuccessMsg('Announcement published successfully.')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create announcement.')
    } finally {
      setSubmitting(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications & Announcements</h1>
          <p className="text-sm text-slate-500">
            Stay updated with your activity alerts and institutional announcements.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Megaphone size={15} />
            {showForm ? 'Cancel' : 'New Announcement'}
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Announcement Creation Form (Admin) */}
      {isAdmin && showForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Publish Announcement</h3>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Announcement title..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Content</label>
              <textarea
                required
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Write your announcement here..."
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Role</label>
                <select
                  value={form.target_role}
                  onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="instructor">Instructors Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Batch ID (optional)</label>
                <input
                  type="number"
                  value={form.batch_id}
                  onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                  className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 1"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { key: 'notifications', label: 'My Notifications', icon: Bell, count: unreadCount },
          { key: 'announcements', label: 'Announcements', icon: Megaphone, count: announcements.length },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={15} />
              {tab.label}
              {tab.count > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Mark all as read
              </button>
            </div>
          )}
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications yet" description="You'll see alerts here when there is activity on your account." />
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
                  n.is_read ? 'bg-white border-slate-100' : 'bg-indigo-50/50 border-indigo-100'
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${n.is_read ? 'text-slate-300' : 'text-indigo-500'}`}>
                  {n.is_read ? <Circle size={16} /> : <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm font-semibold ${n.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                      {n.title}
                    </span>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                      {new Date(n.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                </div>
                {!n.is_read && (
                  <Badge color="indigo" label="New" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements" description="Institutional announcements will appear here." />
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-slate-900 text-sm">{a.title}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.target_role && a.target_role !== 'all' && (
                      <Badge color="blue" label={a.target_role} />
                    )}
                    {a.batch_id && (
                      <Badge color="amber" label={`Batch #${a.batch_id}`} />
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{a.content}</p>
                <div className="flex items-center gap-1 mt-3 text-[11px] text-slate-400">
                  <Calendar size={12} />
                  {new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
