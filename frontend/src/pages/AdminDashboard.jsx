import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  FileSpreadsheet,
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

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/reports/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const kpis = data?.kpis || {}

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administrator Console</h1>
          <p className="text-sm text-slate-500">Live operational metrics, enrollment trends, and financial reconciliation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle size={15} />
            Manage Courses
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <FileSpreadsheet size={15} />
            Export Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Students</span>
            <Users size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.total_students}</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
            <TrendingUp size={12} /> Active Learners
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Faculty</span>
            <GraduationCap size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.total_instructors}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Teaching Staff</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Courses</span>
            <BookOpen size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.total_courses}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Active Syllabus</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Batches</span>
            <Calendar size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.active_batches} / {kpis.total_batches}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Active / Total</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Revenue</span>
            <IndianRupee size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">₹{(kpis.total_revenue || 0).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Paid Invoices</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Dues</span>
            <IndianRupee size={16} className="text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600">₹{(kpis.pending_revenue || 0).toLocaleString()}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Unsettled Fees</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Growth Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Enrollment Trajectory</h3>
              <p className="text-xs text-slate-400">Monthly student admissions overview</p>
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
              Semester View
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.enrollment_trends || []}>
                <defs>
                  <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnroll)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Monthly Collections (INR)</h3>
              <p className="text-xs text-slate-400">Tuition payments received</p>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              Razorpay Verified
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.enrollment_trends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Enrollments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Recent Student Enrollments</h3>
            <p className="text-xs text-slate-400">Latest academic registrations logged in database</p>
          </div>
          <Link
            to="/batches"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View Batch Rosters <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Student Name</th>
                <th className="py-3 px-6">Target Course</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {data?.recent_enrollments?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-400">
                    No enrollments recorded yet.
                  </td>
                </tr>
              ) : (
                data?.recent_enrollments?.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-400">#{e.id}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{e.student_name}</td>
                    <td className="py-3.5 px-6">{e.course_title}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          e.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">{e.date}</td>
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
