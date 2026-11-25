import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Calendar,
  Users,
  PlusCircle,
  Clock,
  X,
  AlertCircle,
  UserPlus,
  Trash2,
} from 'lucide-react'

export default function Batches() {
  const { role } = useAuth()
  const [batches, setBatches] = useState([])
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [rosterBatch, setRosterBatch] = useState(null)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [modalError, setModalError] = useState('')

  // Create form
  const [batchCode, setBatchCode] = useState('')
  const [name, setName] = useState('')
  const [courseId, setCourseId] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [timing, setTiming] = useState('Mon-Wed-Fri 10:00 AM - 12:00 PM IST')
  const [capacity, setCapacity] = useState(30)

  const fetchBatches = () => {
    api
      .get('/batches')
      .then((res) => setBatches(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBatches()
    if (role === 'admin') {
      api.get('/courses').then((r) => setCourses(r.data))
      api.get('/users?role=instructor').then((r) => setInstructors(r.data))
      api.get('/users?role=student').then((r) => setStudents(r.data))
    }
  }, [role])

  const handleCreateBatch = async (e) => {
    e.preventDefault()
    setModalError('')
    try {
      await api.post('/batches', {
        batch_code: batchCode,
        name,
        course_id: Number(courseId),
        instructor_id: instructorId ? Number(instructorId) : null,
        start_date: startDate,
        end_date: endDate,
        schedule_timing: timing,
        capacity: Number(capacity),
        status: 'active',
      })
      setShowCreateModal(false)
      fetchBatches()
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to create batch.')
    }
  }

  const openRoster = async (batchId) => {
    try {
      const res = await api.get(`/batches/${batchId}`)
      setRosterBatch(res.data)
      setModalError('')
    } catch (e) {
      alert('Failed to load roster.')
    }
  }

  const handleEnrollStudent = async () => {
    if (!selectedStudentId || !rosterBatch) return
    setModalError('')
    try {
      await api.post(`/batches/${rosterBatch.id}/students`, {
        student_id: Number(selectedStudentId),
      })
      // Refresh roster & batches list
      openRoster(rosterBatch.id)
      fetchBatches()
      setSelectedStudentId('')
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to enroll student.')
    }
  }

  const handleRemoveStudent = async (studentId) => {
    if (!confirm('Remove student from this batch roster?')) return
    try {
      await api.delete(`/batches/${rosterBatch.id}/students/${studentId}`)
      openRoster(rosterBatch.id)
      fetchBatches()
    } catch (err) {
      alert('Failed to remove student.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cohort & Batch Management</h1>
          <p className="text-sm text-slate-500">Monitor active schedules, seating limits, and student allocations.</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle size={16} />
            Create Cohort Batch
          </button>
        )}
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Batch Code</th>
                <th className="py-4 px-6">Cohort Name</th>
                <th className="py-4 px-6">Assigned Faculty</th>
                <th className="py-4 px-6">Schedule Timetable</th>
                <th className="py-4 px-6">Capacity Meter</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Loading cohorts...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No batches scheduled.
                  </td>
                </tr>
              ) : (
                batches.map((b) => {
                  const pct = Math.round(((b.enrolled_count || 0) / (b.capacity || 30)) * 100)
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-700">{b.batch_code}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{b.name}</td>
                      <td className="py-4 px-6 text-slate-600">
                        {b.instructor
                          ? `${b.instructor.first_name} ${b.instructor.last_name}`
                          : 'Unassigned'}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          <span>{b.schedule_timing || 'TBD'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span>{b.enrolled_count || 0} / {b.capacity}</span>
                          <span className="font-semibold text-slate-500">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pct >= 100 ? 'bg-red-500' : 'bg-indigo-600'}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            b.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openRoster(b.id)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Roster
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roster Modal */}
      {rosterBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {rosterBatch.batch_code}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{rosterBatch.name} Roster</h3>
              </div>
              <button onClick={() => setRosterBatch(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            {/* Allocate Student Input (Admin Only) */}
            {role === 'admin' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Select Student to Allocate --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleEnrollStudent}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <UserPlus size={14} />
                  Add to Cohort
                </button>
              </div>
            )}

            {/* Enrolled Students Table */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {rosterBatch.batch_students?.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No students currently enrolled in this batch.
                </div>
              ) : (
                rosterBatch.batch_students?.map((bs) => (
                  <div key={bs.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                        {bs.student?.first_name ? bs.student.first_name[0] : 'S'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">
                          {bs.student?.first_name} {bs.student?.last_name}
                        </div>
                        <div className="text-[10px] text-slate-400">{bs.student?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-slate-400">
                        Joined {new Date(bs.joined_at).toLocaleDateString()}
                      </span>
                      {role === 'admin' && (
                        <button
                          onClick={() => handleRemoveStudent(bs.student_id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Remove from batch"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRosterBatch(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create Cohort Batch</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Batch Code</label>
                <input
                  type="text"
                  required
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  placeholder="e.g. BATCH-2026-WD02"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Friendly Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full-Stack Cohort Beta 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Course</label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.course_code}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Instructor</label>
                  <select
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">-- Assign Instructor --</option>
                    {instructors.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.first_name} {ins.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Timing</label>
                  <input
                    type="text"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Seat Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
