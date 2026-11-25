import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
  Calendar,
  Users,
  FileCheck,
  Video,
  ArrowRight,
  Clock,
  PlusCircle,
} from 'lucide-react'

export default function InstructorDashboard() {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Workspace</h1>
          <p className="text-sm text-slate-500">Track cohort teaching schedules, grade student coursework, and record session attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/attendance"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Clock size={15} />
            Mark Roll Call
          </Link>
          <Link
            to="/assignments"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <PlusCircle size={15} />
            New Assignment
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Assigned Cohorts</span>
            <Calendar size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.assigned_batches}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active Batches</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Cohort Students</span>
            <Users size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.total_students}</div>
          <div className="text-[11px] text-slate-400 mt-1">Learners Under Instruction</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Evaluations</span>
            <FileCheck size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{kpis.pending_evaluations}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Awaiting Marks & Rubric</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Lectures This Week</span>
            <Video size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.upcoming_lectures}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Scheduled Sessions</div>
        </div>
      </div>

      {/* Teaching Activities & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm">Instructor Operations</h3>
          <div className="space-y-2">
            <Link
              to="/assignments"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              <span>Review Submissions Queue</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
            <Link
              to="/quizzes"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              <span>Build MCQ Assessment</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
            <Link
              to="/attendance"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              <span>Log Daily Attendance</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
            <Link
              to="/batches"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              <span>View Batch Student Rosters</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Upcoming Timetable</h3>
              <p className="text-xs text-slate-400">Class sessions for your assigned cohorts</p>
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
              Mon-Wed-Fri
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  WED
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">
                    Full-Stack Cohort Alpha (BATCH-2026-WD01)
                  </div>
                  <div className="text-[11px] text-slate-500">10:00 AM - 12:00 PM IST · Module 2: FastAPI REST Architecture</div>
                </div>
              </div>
              <Link
                to="/attendance"
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Mark Roll Call
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                  FRI
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">
                    Full-Stack Cohort Alpha (BATCH-2026-WD01)
                  </div>
                  <div className="text-[11px] text-slate-500">10:00 AM - 12:00 PM IST · Module 3: Database & Deployments</div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
