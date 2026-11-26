import React from 'react'

/**
 * Full-panel empty state with an icon, title, and description.
 * @param {React.ComponentType} icon - Lucide icon component
 * @param {string} title - Short heading
 * @param {string} description - Supporting text
 */
export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        {Icon && <Icon size={28} className="text-slate-400" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-400 max-w-xs">{description}</p>}
    </div>
  )
}
