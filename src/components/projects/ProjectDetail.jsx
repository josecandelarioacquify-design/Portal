import React from 'react'
import { format } from 'date-fns'
import { Calendar, DollarSign, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig = {
  planning: { label: 'Planning', className: 'bg-gray-100 text-gray-500' },
  in_progress: { label: 'In Progress', className: 'bg-gray-100 text-gray-700' },
  review: { label: 'Review', className: 'bg-gray-200 text-gray-700' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-600' },
  on_hold: { label: 'On Hold', className: 'bg-amber-50 text-amber-600' },
}

export default function ProjectDetail({ project, open, onClose }) {
  if (!project || !open) return null
  const status = statusConfig[project.status] || statusConfig.planning
  const progress = project.progress || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-card border border-border/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-xs px-2 py-0.5 rounded-full', status.className)}>{status.label}</span>
              {project.priority && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground capitalize">{project.priority}</span>
              )}
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-3">{project.name}</h2>
          {project.client_name && <p className="text-sm text-muted-foreground mt-0.5">{project.client_name}</p>}
        </div>

        <div className="p-6 space-y-6">
          {project.description && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
            </div>
          )}

          <div>
            <div className="flex justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground">Progress</h4>
              <span className="text-sm font-semibold text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {project.start_date && (
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Start Date</span>
                </div>
                <p className="text-sm font-medium">{format(new Date(project.start_date), 'MMM d, yyyy')}</p>
              </div>
            )}
            {project.due_date && (
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Due Date</span>
                </div>
                <p className="text-sm font-medium">{format(new Date(project.due_date), 'MMM d, yyyy')}</p>
              </div>
            )}
          </div>

          {(project.budget || project.spent) && (
            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Budget</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold">${(project.spent || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">of ${(project.budget || 0).toLocaleString()}</p>
                </div>
                {project.budget > 0 && (
                  <div className="w-24 bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(100, ((project.spent || 0) / project.budget) * 100)}%` }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
