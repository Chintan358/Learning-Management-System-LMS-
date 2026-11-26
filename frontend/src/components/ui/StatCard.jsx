import React from 'react'

/**
 * Reusable stat/KPI card for dashboard and report pages.
 * @param {string} label - Card heading label
 * @param {string|number} value - Primary display value
 * @param {React.ComponentType} icon - Lucide icon component
 * @param {string} iconColor - Tailwind text color class for the icon
 * @param {string} sub - Subtitle below the value
 * @param {string} subColor - Tailwind text color class for the subtitle
 */
export default function StatCard({ label, value, icon: Icon, iconColor = 'text-indigo-600', sub, subColor = 'text-slate-500' }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between text-slate-400 mb-2">
        <span className="text-xs font-medium">{label}</span>
        {Icon && <Icon size={18} className={iconColor} />}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value ?? 0}</div>
      {sub && <div className={`text-[11px] font-medium mt-1 ${subColor}`}>{sub}</div>}
    </div>
  )
}
