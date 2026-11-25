import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  PlayCircle,
  CheckCircle2,
  FileText,
  Download,
  Upload,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react'

export default function LecturePlayer() {
  const { courseId, lectureId } = useParams()
  const { role } = useAuth()
  const [lecture, setLecture] = useState(null)
  const [course, setCourse] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [loading, setLoading] = useState(true)

  // Upload modal for instructor
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [matTitle, setMatTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetchLecture = () => {
    api
      .get(`/lectures/${lectureId}`)
      .then((res) => {
        setLecture(res.data)
        setIsCompleted(res.data.is_completed)
      })
      .catch((err) => console.error(err))
  }

  const fetchCourse = () => {
    api
      .get(`/courses/${courseId}`)
      .then((res) => setCourse(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLecture()
    fetchCourse()
  }, [courseId, lectureId])

  const toggleComplete = async () => {
    try {
      const nextState = !isCompleted
      const res = await api.post(`/lectures/${lectureId}/progress?is_completed=${nextState}`)
      setIsCompleted(nextState)
      setProgressMsg(`Course progress updated: ${res.data.course_progress_percentage}%`)
      setTimeout(() => setProgressMsg(''), 4000)
    } catch (e) {
      alert('Failed to update progress.')
    }
  }

  const handleUploadMaterial = async (e) => {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true)
    const formData = new FormData()
    formData.append('title', matTitle)
    formData.append('file', selectedFile)

    try {
      await api.post(`/lectures/${lectureId}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setShowUploadModal(false)
      setMatTitle('')
      setSelectedFile(null)
      fetchLecture()
    } catch (e) {
      alert('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Syllabus
        </Link>
        {progressMsg && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-in fade-in">
            {progressMsg}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main 70% Video & Notes Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Responsive Video Frame */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg aspect-video relative flex items-center justify-center border border-slate-800">
            {lecture?.video_url && lecture.video_url.includes('youtube.com') ? (
              <iframe
                src={`https://www.youtube.com/embed/${lecture.video_url.split('v=')[1]?.split('&')[0] || ''}`}
                title={lecture.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-center p-8 text-white space-y-2">
                <PlayCircle size={48} className="mx-auto text-indigo-400" />
                <h4 className="font-semibold text-sm">{lecture?.title}</h4>
                <p className="text-xs text-slate-400">Streamed from Cloudinary Secure CDN</p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Lesson {lecture?.sequence || 1}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">{lecture?.title}</h2>
              <span className="text-xs text-slate-400">{lecture?.duration_mins} Minutes Duration</span>
            </div>

            {role === 'student' && (
              <button
                onClick={toggleComplete}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <CheckCircle2 size={16} />
                <span>{isCompleted ? 'Completed ✓' : 'Mark as Complete'}</span>
              </button>
            )}
          </div>

          {/* Lesson Transcript & Study Materials */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h3 className="font-bold text-slate-900 text-base">Lesson Notes & Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lecture?.description || 'Review the attached lesson notes, study materials, and practical exercises below.'}
            </p>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 text-xs">Attached Study Materials</h4>
                {(role === 'admin' || role === 'instructor') && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    <Upload size={14} />
                    Upload File
                  </button>
                )}
              </div>

              {lecture?.materials?.length === 0 ? (
                <div className="text-xs text-slate-400">No downloadable materials for this lesson.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lecture?.materials?.map((m) => (
                    <a
                      key={m.id}
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-white flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText size={18} className="text-indigo-600 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-900 truncate">{m.title}</div>
                          <div className="text-[10px] text-slate-400 uppercase">{m.file_type} · {m.file_size_kb || 500} KB</div>
                        </div>
                      </div>
                      <Download size={16} className="text-slate-400 group-hover:text-indigo-600 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 30% Playlist Column */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Course Playlist</h3>
            <span className="text-[11px] text-indigo-600 font-medium">{course?.title}</span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {course?.modules?.map((mod, mIdx) => (
              <div key={mod.id} className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Module {mIdx + 1}: {mod.title}
                </div>
                <div className="space-y-1">
                  {mod.lectures?.map((l) => {
                    const isCurrent = Number(l.id) === Number(lectureId)
                    return (
                      <Link
                        key={l.id}
                        to={`/courses/${courseId}/lectures/${l.id}`}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                          isCurrent
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <PlayCircle size={14} className={isCurrent ? 'text-indigo-600' : 'text-slate-400'} />
                          <span className="truncate">{l.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{l.duration_mins}m</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Study Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Upload Study Material</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="e.g. Architecture Reference Sheet (PDF)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Select File (PDF, PPT, ZIP)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
