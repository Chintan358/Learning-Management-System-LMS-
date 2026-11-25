import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Users,
  Search,
  Check,
  Percent,
} from 'lucide-react'

export default function Attendance() {
  const { user, role } = useAuth()
  const isInstructorOrAdmin = role === 'admin' || role === 'instructor'

  // Instructor/Admin state
  const [batches, setBatches] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0])
  const [batchData, setBatchData] = useState(null)
  const [roster, setRoster] = useState([]) // [{ student_id, first_name, last_name, email, status: 'present'|'absent'|'late'|'excused', remarks: '' }]
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')

  // Student state
  const [studentSummary, setStudentSummary] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isInstructorOrAdmin) {
      loadBatches()
    } else {
      loadStudentAttendance()
    }
  }, [role])

  const loadBatches = async () => {
    try {
      setLoading(true)
      const res = await api.get('/batches')
      setBatches(res.data)
      if (res.data.length > 0) {
        setSelectedBatchId(res.data[0].id)
      }
    } catch (err) {
      setError('Failed to load batches list.')
    } finally {
      setLoading(false)
    }
  }

  const loadStudentAttendance = async () => {
    try {
      setLoading(true)
      const res = await api.get('/attendance/my-summary')
      setStudentSummary(res.data)
    } catch (err) {
      setError('Failed to fetch attendance summary.')
    } finally {
      setLoading(false)
    }
  }

  // Load roster and existing attendance when batch or date changes
  useEffect(() => {
    if (isInstructorOrAdmin && selectedBatchId) {
      loadBatchRosterAndRecords()
    }
  }, [selectedBatchId, classDate])

  const loadBatchRosterAndRecords = async () => {
    try {
      setError('')
      setSaveSuccess('')
      const [batchRes, attendanceRes] = await Promise.all([
        api.get(`/batches/${selectedBatchId}`),
        api.get(`/attendance/batch/${selectedBatchId}?class_date=${classDate}`).catch(() => ({ data: [] })),
      ])

      setBatchData(batchRes.data)
      const students = batchRes.data.students || []
      const existingRecords = attendanceRes.data || []

      const recordMap = {}
      existingRecords.forEach((rec) => {
        recordMap[rec.student_id] = rec
      })

      const initialRoster = students.map((s) => {
        const studentInfo = s.student || s
        const existing = recordMap[studentInfo.id]
        return {
          student_id: studentInfo.id,
          first_name: studentInfo.first_name,
          last_name: studentInfo.last_name,
          email: studentInfo.email,
          status: existing ? existing.status : 'present',
          remarks: existing?.remarks || '',
        }
      })

      setRoster(initialRoster)
    } catch (err) {
      setError('Failed to load batch students or existing attendance records.')
    }
  }

  const handleStatusChange = (studentId, newStatus) => {
    setRoster((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status: newStatus } : r))
    )
  }

  const handleRemarksChange = (studentId, remarks) => {
    setRoster((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, remarks } : r))
    )
  }

  const markAll = (status) => {
    setRoster((prev) => prev.map((r) => ({ ...r, status })))
  }

  const saveAttendanceSheet = async () => {
    try {
      setSaving(true)
      setError('')
      setSaveSuccess('')

      const payload = {
        batch_id: parseInt(selectedBatchId),
        class_date: classDate,
        records: roster.map((r) => ({
          student_id: r.student_id,
          status: r.status,
          remarks: r.remarks,
        })),
      }

      await api.post('/attendance', payload)
      setSaveSuccess(`Attendance for ${classDate} saved successfully (${roster.length} students).`)
      setTimeout(() => setSaveSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit attendance.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Tracking</h1>
          <p className="text-sm text-slate-500">
            {isInstructorOrAdmin
              ? 'Roll call management, session attendance rosters, and eligibility compliance.'
              : 'Review your session participation records and certificate eligibility criteria.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* STUDENT VIEW */}
      {!isInstructorOrAdmin && (
        <div className="space-y-6">
          {studentSummary ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Total Sessions
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {studentSummary.total_classes ?? 0}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Present
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {studentSummary.present_classes ?? 0}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <XCircle size={22} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Absent
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {studentSummary.absent_classes ?? 0}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                      (studentSummary.attendance_percentage ?? 0) >= 75
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <Percent size={22} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Compliance Rate
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {studentSummary.attendance_percentage ?? 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirement Alert */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  studentSummary.attendance_percentage >= 75
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50/60 border-amber-200 text-amber-900'
                }`}
              >
                <AlertCircle size={20} className="shrink-0" />
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold">Institutional Requirement:</span> Students must
                  maintain at least <strong>75% attendance</strong> to qualify for final course
                  certificates. Your current attendance stands at{' '}
                  <strong>{studentSummary.attendance_percentage}%</strong> (
                  {studentSummary.attendance_percentage >= 75
                    ? 'Eligible for graduation certification'
                    : 'Action required: attendance below threshold'}
                  ).
                </div>
              </div>

              {/* Breakdown History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Session Log Details ({(studentSummary.records || []).length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Batch</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(studentSummary.records || []).length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-6 text-center text-slate-400">
                            Summary calculated from {studentSummary.total_classes ?? 0} total recorded sessions.
                          </td>
                        </tr>
                      ) : (
                        (studentSummary.records || []).map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3.5 font-medium text-slate-900">
                              {rec.class_date}
                            </td>
                            <td className="p-3.5 text-slate-600">
                              Batch #{rec.batch_id}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                                  rec.status === 'present'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : rec.status === 'absent'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-500">
                              {rec.remarks || '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              Loading attendance data...
            </div>
          )}
        </div>
      )}

      {/* INSTRUCTOR / ADMIN VIEW */}
      {isInstructorOrAdmin && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Target Batch
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.course?.name || `Course #${b.course_id}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Class Date
                </label>
                <input
                  type="date"
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => markAll('present')}
                className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('absent')}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
              >
                Mark All Absent
              </button>
              <button
                type="button"
                onClick={saveAttendanceSheet}
                disabled={saving || roster.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Roll Call'}
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Roster Roll Call ({roster.length} Enrolled Students)
                </h3>
                <p className="text-xs text-slate-500">
                  Select student attendance status for {classDate}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Notes / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roster.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-400">
                        No students enrolled in this batch yet.
                      </td>
                    </tr>
                  ) : (
                    roster.map((row) => (
                      <tr key={row.student_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 font-medium text-slate-900">
                          {row.first_name} {row.last_name}
                        </td>
                        <td className="p-3.5 text-slate-500">{row.email}</td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {[
                              { key: 'present', label: 'Present', color: 'emerald' },
                              { key: 'absent', label: 'Absent', color: 'red' },
                              { key: 'late', label: 'Late', color: 'amber' },
                              { key: 'excused', label: 'Excused', color: 'blue' },
                            ].map((pill) => {
                              const isSelected = row.status === pill.key
                              return (
                                <button
                                  key={pill.key}
                                  type="button"
                                  onClick={() => handleStatusChange(row.student_id, pill.key)}
                                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                    isSelected
                                      ? pill.color === 'emerald'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : pill.color === 'red'
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : pill.color === 'amber'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {pill.label}
                                </button>
                              )
                            })}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={row.remarks}
                            onChange={(e) => handleRemarksChange(row.student_id, e.target.value)}
                            className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {roster.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {roster.filter((r) => r.status === 'present').length} Present,{' '}
                  {roster.filter((r) => r.status === 'absent').length} Absent,{' '}
                  {roster.filter((r) => r.status === 'late').length} Late
                </span>
                <button
                  type="button"
                  onClick={saveAttendanceSheet}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Roll Call'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
