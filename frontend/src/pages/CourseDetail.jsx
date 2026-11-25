import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Clock,
  BookOpen,
  PlayCircle,
  FileText,
  CreditCard,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
} from 'lucide-react'

export default function CourseDetail() {
  const { id } = useParams()
  const { role } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openModuleId, setOpenModuleId] = useState(null)

  // Module creation modal (for instructor/admin)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleDesc, setModuleDesc] = useState('')

  const fetchCourse = () => {
    api
      .get(`/courses/${id}`)
      .then((res) => {
        setCourse(res.data)
        if (res.data.modules && res.data.modules.length > 0) {
          setOpenModuleId(res.data.modules[0].id)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourse()
  }, [id])

  const handleAddModule = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/courses/${id}/modules`, {
        title: moduleTitle,
        description: moduleDesc,
        order_index: (course.modules?.length || 0) + 1,
      })
      setShowModuleModal(false)
      setModuleTitle('')
      setModuleDesc('')
      fetchCourse()
    } catch (e) {
      alert('Failed to add module.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!course) {
    return <div className="text-center py-12 text-slate-500">Course not found.</div>
  }

  return (
    <div className="space-y-8">
      {/* Course Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700">
              {course.course_code}
            </span>
            <span className="text-xs text-slate-500 font-medium">{course.category}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {course.title}
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock size={16} className="text-indigo-600" />
              <span>{course.duration_weeks} Weeks Estimated</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <BookOpen size={16} className="text-indigo-600" />
              <span>{course.modules?.length || 0} Modules</span>
            </div>
          </div>
        </div>

        {/* Pricing / Enrollment Action Card */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Tuition Investment</span>
            <div className="text-3xl font-bold text-slate-900 mt-1">
              ₹{Number(course.fee).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Full cohort access including live lectures, code reviews, and certification.
            </p>
          </div>

          <div className="space-y-2">
            {role === 'student' && (
              <Link
                to="/payments"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <CreditCard size={15} />
                Pay Tuition via Razorpay
              </Link>
            )}

            {(role === 'admin' || role === 'instructor') && (
              <button
                onClick={() => setShowModuleModal(true)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <PlusCircle size={15} />
                Add Syllabus Module
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Curriculum Syllabus</h2>
            <p className="text-xs text-slate-500">Modules and sequential learning units</p>
          </div>
        </div>

        {course.modules?.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No modules added to this syllabus yet.
          </div>
        ) : (
          <div className="space-y-3">
            {course.modules?.map((m, idx) => {
              const isOpen = openModuleId === m.id
              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenModuleId(isOpen ? null : m.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{m.title}</h4>
                        <span className="text-[11px] text-slate-400">
                          {m.lectures?.length || 0} Lessons
                        </span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 divide-y divide-slate-100 bg-white">
                      {m.lectures?.length === 0 ? (
                        <div className="text-xs text-slate-400 py-2">No lectures published yet.</div>
                      ) : (
                        m.lectures?.map((lec) => (
                          <div
                            key={lec.id}
                            className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle size={18} className="text-indigo-600 shrink-0" />
                              <div>
                                <h5 className="font-medium text-slate-800 text-xs">{lec.title}</h5>
                                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                  <span>{lec.duration_mins} mins</span>
                                  {lec.materials?.length > 0 && (
                                    <span className="flex items-center gap-0.5 text-indigo-600">
                                      <FileText size={10} /> {lec.materials.length} Material
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Link
                              to={`/courses/${course.id}/lectures/${lec.id}`}
                              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              Open Lesson
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Add Course Module</h3>
              <button onClick={() => setShowModuleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 4: Cloudflare & Vercel Deployments"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Module Scope / Description</label>
                <textarea
                  rows="3"
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Topics, tools, and objectives covered..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
