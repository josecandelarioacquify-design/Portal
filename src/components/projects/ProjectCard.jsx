import React from 'react'
import { format } from 'date-fns'
import { Calendar, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig = {
  planning: { label: 'Planning', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  in_progress: { label: 'In Progress', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  review: { label: 'Review', className: 'bg-gray-200 text-gray-700 border-gray-300' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  on_hold: { label: 'On Hold', className: 'bg-amber-50 text-amber-600 border-amber-200' },
}

const priorityConfig = {
  low: { label: 'Low', className: 'bg-gray-50 text-gray-400 border-gray-200' },
  medium: { label: 'Medium', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-500 border-orange-200' },
  urgent: { label: 'Urgent', className: 'bg-red-50 text-red-500 border-red-200' },
}

export default function ProjectCard({ project, onClick }) {
  const status = statusConfig[project.status] || statusConfig.planning
  const priority = priorityConfig[project.priority] || priorityConfig.medium
  const progress = project.progress || 0

  return (
    <div
      onClick={() => onClick?.(project)}
      className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{project.name}</h3>
          {project.client_name && <p className="text-xs text-muted-foreground mt-0.5">{project.client_name}</p>}
        </div>
        <span className={cn('text-[11px] px-2 py-0.5 rounded-full border shrink-0 ml-2', status.className)}>{status.label}</span>
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium text-foreground">{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', priority.className)}>{priority.label}</span>
          {project.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(new Date(project.due_date), 'MMM d')}
            </div>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  )
}
