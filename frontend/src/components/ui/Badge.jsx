import React from 'react'

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
}

/**
 * Reusable badge pill component.
 * @param {string} label - Text to show
 * @param {'indigo'|'emerald'|'red'|'amber'|'blue'|'slate'} color - Color theme
 * @param {string} className - Extra Tailwind classes
 */
export default function Badge({ label, color = 'indigo', className = '' }) {
  const colors = colorMap[color] || colorMap.indigo
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${colors} ${className}`}
    >
      {label}
    </span>
  )
}
