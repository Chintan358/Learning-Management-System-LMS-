import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  BookOpen,
  PlusCircle,
  Search,
  Clock,
  IndianRupee,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react'

export default function Courses() {
  const { role } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  // Create Modal
  const [showModal, setShowModal] = useState(false)
  const [courseCode, setCourseCode] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [courseCategory, setCourseCategory] = useState('Software Engineering')
  const [durationWeeks, setDurationWeeks] = useState(8)
  const [fee, setFee] = useState(14999)
  const [modalError, setModalError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCourses = () => {
    let url = '/courses?'
    if (search) url += `search=${encodeURIComponent(search)}&`
    if (category) url += `category=${encodeURIComponent(category)}&`

    api
      .get(url)
      .then((res) => setCourses(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourses()
  }, [search, category])

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setModalError('')
    setSubmitting(true)
    try {
      await api.post('/courses', {
        course_code: courseCode,
        title,
        description,
        category: courseCategory,
        duration_weeks: Number(durationWeeks),
        fee: Number(fee),
        thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
        status: 'published',
      })
      setShowModal(false)
      // Reset form
      setCourseCode('')
      setTitle('')
      setDescription('')
      fetchCourses()
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to create course.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Catalogue</h1>
          <p className="text-sm text-slate-500">Explore comprehensive curricula, modules, and instructional tracks.</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle size={16} />
            Create New Course
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or course code..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="">All Categories</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Cloud Computing">Cloud Computing</option>
          <option value="Data Science">Data Science</option>
        </select>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          No courses found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-indigo-300 transition-all group"
            >
              <div>
                <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={course.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/90 text-indigo-700 backdrop-blur-xs shadow-xs">
                    {course.course_code}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900/80 text-white uppercase backdrop-blur-xs">
                    {course.status}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                    {course.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description || 'Comprehensive curriculum with hands-on projects and guided assessments.'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={14} className="text-slate-400" />
                  <span>{course.duration_weeks} Weeks</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-slate-900">
                    ₹{Number(course.fee).toLocaleString()}
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Create Course Curriculum</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. CS-FSW202"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title of course"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tuition Fee (INR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Course overview and syllabus goals..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
