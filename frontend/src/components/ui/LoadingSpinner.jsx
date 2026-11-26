import React from 'react'

/**
 * Centred indigo spinning loader.
 * @param {string} message - Optional label below the spinner
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      {message && <span className="text-slate-500 text-sm font-medium">{message}</span>}
    </div>
  )
}
