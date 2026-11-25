import React, { useState, useEffect } from 'react'
import api from '../services/api'
import {
  BarChart3,
  Download,
  Users,
  CreditCard,
  BookOpen,
  Calendar,
  Search,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingEnrollments, setDownloadingEnrollments] = useState(false)
  const [downloadingRevenue, setDownloadingRevenue] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setLoading(true)
      const res = await api.get('/reports/dashboard')
      setData(res.data)
    } catch (err) {
      setError('Failed to fetch institutional analytics data.')
    } finally {
      setLoading(false)
    }
  }

  const handleExportEnrollments = async () => {
    try {
      setDownloadingEnrollments(true)
      const res = await api.get('/reports/export/enrollments', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `enrollment_report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError('Failed to export enrollments CSV.')
    } finally {
      setDownloadingEnrollments(false)
    }
  }

  const handleExportRevenue = async () => {
    try {
      setDownloadingRevenue(true)
      const res = await api.get('/reports/export/revenue', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `revenue_audit_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError('Failed to export revenue CSV.')
    } finally {
      setDownloadingRevenue(false)
    }
  }

  const filteredEnrollments = (data?.recent_enrollments || []).filter((e) => {
    const q = filterQuery.toLowerCase()
    return (
      e.student_name?.toLowerCase().includes(q) ||
      e.course_title?.toLowerCase().includes(q) ||
      e.status?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Page Heading & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">
            Institutional intelligence, revenue auditing, enrollment trajectories, and CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportEnrollments}
            disabled={downloadingEnrollments}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet size={14} />
            {downloadingEnrollments ? 'Exporting...' : 'Export Enrollments CSV'}
          </button>
          <button
            onClick={handleExportRevenue}
            disabled={downloadingRevenue}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            {downloadingRevenue ? 'Exporting...' : 'Export Revenue CSV'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.total_students || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Across all academic batches</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Batches
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.active_batches || data?.total_batches || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Currently running sessions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            ₹{parseFloat(data?.total_revenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Cleared tuition fees</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Receivables
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            ₹{parseFloat(data?.pending_revenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Outstanding installment balances</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Monthly Enrollment Trajectory</h3>
          <p className="text-xs text-slate-400 mb-6">Total student admissions per month</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.enrollment_trends || []}>
                <defs>
                  <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#enrollmentGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Monthly Revenue Realization</h3>
          <p className="text-xs text-slate-400 mb-6">Cleared tuition fee payments (in INR ₹)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.enrollment_trends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filterable Recent Enrollments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Student Enrollment Registry</h3>
            <p className="text-xs text-slate-500">Live roster of student registrations across courses.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Filter by student, course..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Course Enrolled</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Enrollment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No enrollments match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">#{e.id}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{e.student_name}</td>
                    <td className="p-3.5 text-slate-700">{e.course_title}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                        {e.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{e.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
