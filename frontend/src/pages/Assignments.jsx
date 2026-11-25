import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  FileCheck,
  Calendar,
  Clock,
  PlusCircle,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react'

export default function Assignments() {
  const { role } = useAuth()
  const [batches, setBatches] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState(1)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  // Student Submission Modal
  const [submitModalAsg, setSubmitModalAsg] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Instructor Grading Modal
  const [gradeModalSub, setGradeModalSub] = useState(null)
  const [submissionsList, setSubmissionsList] = useState([])
  const [marks, setMarks] = useState('')
  const [feedback, setFeedback] = useState('')

  // Create Assignment Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [asgTitle, setAsgTitle] = useState('')
  const [asgDesc, setAsgDesc] = useState('')
  const [maxMarks, setMaxMarks] = useState(100)
  const [dueDate, setDueDate] = useState('')

  const fetchBatches = () => {
    api.get('/batches').then((res) => {
      setBatches(res.data)
      if (res.data.length > 0 && !selectedBatchId) {
        setSelectedBatchId(res.data[0].id)
      }
    })
  }

  const fetchAssignments = () => {
    if (!selectedBatchId) return
    api
      .get(`/assignments?batch_id=${selectedBatchId}`)
      .then((res) => setAssignments(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    if (selectedBatchId) {
      fetchAssignments()
    }
  }, [selectedBatchId])

  const handleStudentSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`/assignments/${submitModalAsg.id}/submit`, {
        file_url: fileUrl || 'https://res.cloudinary.com/demo/image/upload/sample_solution.pdf',
      })
      setSubmitModalAsg(null)
      setFileUrl('')
      fetchAssignments()
      alert('Assignment submitted successfully!')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit assignment.')
    } finally {
      setSubmitting(false)
    }
  }

  const openSubmissions = async (asgId) => {
    try {
      const res = await api.get(`/assignments/${asgId}/submissions`)
      setSubmissionsList(res.data)
    } catch (e) {
      alert('Failed to load submissions.')
    }
  }

  const handleGradeSubmission = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/assignments/submissions/${gradeModalSub.id}/grade`, {
        marks_awarded: Number(marks),
        feedback,
      })
      setGradeModalSub(null)
      setMarks('')
      setFeedback('')
      openSubmissions(gradeModalSub.assignment_id)
      fetchAssignments()
      alert('Grade and feedback submitted!')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to grade submission.')
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      await api.post('/assignments', {
        batch_id: Number(selectedBatchId),
        title: asgTitle,
        description: asgDesc,
        max_marks: Number(maxMarks),
        due_date: dueDate,
      })
      setShowCreateModal(false)
      setAsgTitle('')
      setAsgDesc('')
      fetchAssignments()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create assignment.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments & Coursework</h1>
          <p className="text-sm text-slate-500">Deliver practical projects, track deadlines, and receive evaluator rubrics.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Cohort Selector */}
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batch_code}: {b.name}
              </option>
            ))}
          </select>

          {(role === 'admin' || role === 'instructor') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              <PlusCircle size={15} />
              Create Assignment
            </button>
          )}
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No assignments published for this cohort batch yet.
          </div>
        ) : (
          assignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-indigo-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Max: {asg.max_marks} Points
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={13} />
                    Due: {new Date(asg.due_date).toLocaleString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{asg.title}</h3>
                <p className="text-xs text-slate-600 max-w-2xl">{asg.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {role === 'student' && (
                  <button
                    onClick={() => setSubmitModalAsg(asg)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <Upload size={14} />
                    Submit Solution
                  </button>
                )}

                {(role === 'admin' || role === 'instructor') && (
                  <button
                    onClick={() => openSubmissions(asg.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-slate-200"
                  >
                    <FileCheck size={14} />
                    Submissions ({asg.submissions_count || 0})
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Student Submit Modal */}
      {submitModalAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Submit Solution File</h3>
              <button onClick={() => setSubmitModalAsg(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">{submitModalAsg.title}</p>

            <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Deliverable URL (Cloudinary / GitHub / Drive)</label>
                <input
                  type="url"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/demo/image/upload/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalAsg(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {submitting ? 'Uploading...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions List Modal (Instructor) */}
      {submissionsList.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Student Deliverable Submissions</h3>
              <button onClick={() => setSubmissionsList([])} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {submissionsList.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {sub.student?.first_name} {sub.student?.last_name}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Submitted: {new Date(sub.submitted_at).toLocaleString()}</span>
                      {sub.is_late && <span className="text-red-500 font-semibold">(LATE)</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                    >
                      View File
                    </a>

                    <button
                      onClick={() => setGradeModalSub(sub)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
                    >
                      {sub.status === 'evaluated' ? 'Regrade' : 'Grade'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {gradeModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Grade Submission</h3>
              <button onClick={() => setGradeModalSub(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Marks Awarded</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="e.g. 95"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Qualitative Feedback</label>
                <textarea
                  rows="3"
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Review observations and rubric notes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradeModalSub(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Create Cohort Assignment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. Project 2: Interactive Kanban Board"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Detailed Brief & Instructions</label>
                <textarea
                  rows="3"
                  required
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  placeholder="Requirements, rubric criteria, and deliverables expected..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Maximum Points</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
