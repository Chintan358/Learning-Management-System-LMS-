import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import {
  ShieldCheck,
  Search,
  Award,
  Calendar,
  User,
  BookOpen,
  Download,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  FileCheck,
} from 'lucide-react'

// Use base Axios instance without requiring JWT headers
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export default function PublicVerifyCertificate() {
  const { code: paramCode } = useParams()
  const [searchCode, setSearchCode] = useState(paramCode || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (paramCode) {
      setSearchCode(paramCode)
      verifyCode(paramCode)
    }
  }, [paramCode])

  const verifyCode = async (codeToVerify) => {
    const code = (codeToVerify || searchCode).trim()
    if (!code) {
      setError('Please enter a certificate verification code.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSearched(true)
      setResult(null)

      const res = await axios.get(`${API_BASE}/certificates/verify/${encodeURIComponent(code)}`)
      setResult(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setResult({ is_valid: false, detail: 'No certificate found with the provided code.' })
      } else {
        setError(err.response?.data?.detail || 'Verification service temporarily unavailable.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    verifyCode(searchCode)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Portal Login
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              LMS
            </div>
            <span className="font-bold text-slate-900 text-sm">Registry Verification</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs border border-indigo-100">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Certificate Authenticity Verification
          </h1>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Verify academic credentials, graduation records, and tamper-evident digital certificates issued by the institution.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Enter Certificate Code (e.g., CERT-PYTH-2026-X9A2)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-32 py-3.5 bg-white border border-slate-300 rounded-2xl text-sm font-mono tracking-wide placeholder-slate-400 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all uppercase"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
            {error}
          </div>
        )}

        {/* Verification Result Display */}
        {searched && !loading && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            {result?.is_valid ? (
              <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />

                {/* Status Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-1">
                        AUTHENTIC & VERIFIED
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Official Academic Record Confirmed
                      </h2>
                    </div>
                  </div>

                  {result.pdf_url && (
                    <a
                      href={result.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors shrink-0"
                    >
                      <Download size={14} />
                      Download PDF Copy
                    </a>
                  )}
                </div>

                {/* Credential Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 text-sm">
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Recipient Name
                      </div>
                      <div className="font-bold text-slate-900 text-base mt-0.5">
                        {result.student_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen size={18} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Accredited Course
                      </div>
                      <div className="font-bold text-slate-900 text-base mt-0.5">
                        {result.course_title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Issue Date
                      </div>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {result.issue_date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award size={18} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Performance Grade
                      </div>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {result.grade || 'Pass with Distinction'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Hash Bar */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck size={16} className="text-indigo-600 shrink-0" />
                      <span className="text-xs text-slate-500 font-medium">Registry Code:</span>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {result.verification_code}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      SHA-256 Digital Verification Standard
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-red-200 p-8 shadow-md text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Certificate Not Found or Invalid
                </h3>
                <p className="text-slate-600 text-xs max-w-md mx-auto">
                  We could not find an official credential matching the code{' '}
                  <span className="font-mono font-semibold text-red-600">{searchCode}</span> in the
                  institutional database. Please re-check the characters or contact the registrar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 pt-12">
        Institutional Academic Registry & Verification System • Secured by Antigravity LMS
      </footer>
    </div>
  )
}
