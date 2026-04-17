import React from 'react'
import { format } from 'date-fns'
import { FileText, FolderOpen, CalendarDays } from 'lucide-react'

export default function RecentActivity({ projects, documents, events }) {
  const activities = [
    ...projects.slice(0, 3).map(p => ({
      type: 'project',
      title: p.name,
      subtitle: `Status: ${p.status?.replace(/_/g, ' ')}`,
      date: p.updated_at || p.created_at,
      icon: FolderOpen,
    })),
    ...documents.slice(0, 3).map(d => ({
      type: 'document',
      title: d.title,
      subtitle: d.category?.replace(/_/g, ' '),
      date: d.updated_at || d.created_at,
      icon: FileText,
    })),
    ...events.slice(0, 3).map(e => ({
      type: 'event',
      title: e.title,
      subtitle: e.event_type?.replace(/_/g, ' '),
      date: e.date,
      icon: CalendarDays,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
        )}
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="p-2 rounded-lg bg-primary/5">
              <activity.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{activity.subtitle}</p>
            </div>
            <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap">
              {activity.date ? format(new Date(activity.date), 'MMM d') : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
