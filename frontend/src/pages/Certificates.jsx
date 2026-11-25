import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Award,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react'

export default function Certificates() {
  const { user, role } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [courses, setCourses] = useState([])
  const [generatingForCourseId, setGeneratingForCourseId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    loadCertificatesAndCourses()
  }, [])

  const loadCertificatesAndCourses = async () => {
    try {
      setLoading(true)
      const [certRes, courseRes] = await Promise.all([
        api.get('/certificates/my-certificates'),
        api.get('/courses'),
      ])
      setCertificates(certRes.data)
      setCourses(courseRes.data)
    } catch (err) {
      setError('Failed to fetch certificate or course records.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCertificate = async (courseId) => {
    try {
      setGeneratingForCourseId(courseId)
      setError('')
      setSuccessMsg('')
      const res = await api.post('/certificates/generate', { course_id: courseId })
      setSuccessMsg(`Congratulations! Certificate generated successfully. Code: ${res.data.verification_code}`)
      loadCertificatesAndCourses()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'You have not met all eligibility requirements (100% lectures, 75% attendance, 50% quiz/assignment scores, fee clearance).'
      )
    } finally {
      setGeneratingForCourseId(null)
    }
  }

  const copyVerifyLink = (code) => {
    const url = `${window.location.origin}/verify-certificate/${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Certificates</h1>
          <p className="text-sm text-slate-500">
            Tamper-evident accredited graduation certificates with digital signature verification.
          </p>
        </div>

        <Link
          to="/verify-certificate"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
        >
          <ShieldCheck size={16} />
          Public Verification Portal
        </Link>
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

      {/* Graduation Criteria Guidelines */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Institutional Graduation & Certificate Eligibility Rules
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Certificates are cryptographically generated and signed upon satisfaction of 5 institutional criteria:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-indigo-100/60 flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>100% Lecture Completion</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100/60 flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>≥ 75% Batch Attendance</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100/60 flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>≥ 50% Quizzes & Assignments</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-indigo-100/60 flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>100% Fee Settlement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issued Certificates */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award size={20} className="text-indigo-600" />
          Issued Certificates ({certificates.length})
        </h2>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No certificates have been issued yet. Complete all modules in your enrolled courses to request certification.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between"
              >
                {/* Decorative border accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Award size={26} />
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                      <ShieldCheck size={13} />
                      Verified & Accredited
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-4">
                    {courses.find((c) => c.id === cert.course_id)?.title || `Course #${cert.course_id}`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Issued to <strong>{cert.student?.first_name || user?.first_name} {cert.student?.last_name || user?.last_name}</strong> on{' '}
                    {new Date(cert.issue_date).toLocaleDateString()}
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Verification Code
                      </div>
                      <div className="font-mono font-bold text-xs text-slate-800">
                        {cert.verification_code}
                      </div>
                    </div>
                    <button
                      onClick={() => copyVerifyLink(cert.verification_code)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copiedCode === cert.verification_code ? (
                        <>
                          <Check size={13} className="text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/verify-certificate/${cert.verification_code}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <ExternalLink size={14} />
                    Verify Authenticity
                  </Link>

                  {cert.pdf_url && (
                    <a
                      href={cert.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Download size={14} />
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Enrolled Courses for Certification Request */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText size={20} className="text-slate-600" />
          Request Course Certification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((c) => {
            const alreadyIssued = certificates.some((cert) => cert.course_id === c.id)
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {c.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-2">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  {alreadyIssued ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <CheckCircle2 size={16} />
                      Certificate Issued
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateCertificate(c.id)}
                      disabled={generatingForCourseId === c.id}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Award size={14} />
                      {generatingForCourseId === c.id ? 'Evaluating...' : 'Evaluate & Generate'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
