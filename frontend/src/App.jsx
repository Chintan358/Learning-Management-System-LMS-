import React from 'react'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-sm">
          LMS
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Learning Management System</h1>
        <p className="text-slate-600 text-sm mb-6">
          Institutional multi-role platform for Administrators, Instructors, and Students.
        </p>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          ● Platform Initialized & Healthy
        </div>
      </div>
    </div>
  )
}

export default App
