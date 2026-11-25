import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  FileCheck,
  HelpCircle,
  PlayCircle,
  Award,
  CreditCard,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
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
  const progressPct = kpis.overall_progress_percentage || 0
  const attendancePct = kpis.attendance_percentage || 0

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-100 backdrop-blur-md mb-3 border border-white/20">
            Student Learning Space
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
            Track your lectures, complete weekly assignment deliverables, and monitor your certificate eligibility milestones.
          </p>
        </div>

        {/* Circular Progress Display */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-400 border-t-transparent flex items-center justify-center font-bold text-lg">
            {progressPct}%
          </div>
          <div>
            <div className="text-xs text-indigo-200 uppercase font-semibold">Course Progress</div>
            <div className="text-sm font-bold text-white">{kpis.completed_lectures} / {kpis.total_lectures || 3} Lectures</div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Enrolled Courses</span>
            <BookOpen size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.enrolled_courses || 1}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active Curriculum</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Work</span>
            <FileCheck size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{kpis.pending_assignments || 1}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Assignments Due</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Scheduled Quizzes</span>
            <HelpCircle size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.upcoming_quizzes || 1}</div>
          <div className="text-[11px] text-slate-400 mt-1">Timed MCQ Assessment</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Attendance Rate</span>
            <CheckCircle2 size={18} className={attendancePct >= 75 ? 'text-emerald-500' : 'text-red-500'} />
          </div>
          <div className={`text-2xl font-bold ${attendancePct >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
            {attendancePct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {attendancePct >= 75 ? 'Meets 75% Requirement' : 'Below 75% Threshold'}
          </div>
        </div>
      </div>

      {/* Main Student Hub Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Courses Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm">Resume Learning</h3>
            <Link to="/courses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Browse All Courses <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <PlayCircle size={32} />
              </div>
              <div>
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 mb-1">
                  CS-FSW101
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Full-Stack Web Development with React & FastAPI</h4>
                <p className="text-xs text-slate-500 mt-0.5">Cohort: Full-Stack Cohort Alpha 2026</p>
              </div>
            </div>

            <Link
              to="/courses/1/lectures/1"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs transition-colors"
            >
              Continue Lesson
            </Link>
          </div>
        </div>

        {/* Certification Eligibility Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-slate-900 text-sm">Certificate Eligibility</h3>
          </div>

          <p className="text-xs text-slate-500">
            Fulfill institutional rules to unlock your verified PDF completion certificate.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Lecture Completion (Req: 80%)</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressPct >= 80 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Classroom Attendance (Req: 75%)</span>
                <span>{attendancePct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${attendancePct >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, attendancePct)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Link
            to="/certificates"
            className="block text-center w-full py-2 bg-slate-100 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            Check Certificate Status
          </Link>
        </div>
      </div>
    </div>
  )
}
