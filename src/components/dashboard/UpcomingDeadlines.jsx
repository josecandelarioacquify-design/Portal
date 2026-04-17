import React from 'react'
import { format, isPast, isToday, differenceInDays } from 'date-fns'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UpcomingDeadlines({ projects, events }) {
  const deadlines = [
    ...projects.filter(p => p.due_date && p.status !== 'completed').map(p => ({
      title: p.name,
      date: p.due_date,
      type: 'Project Deadline',
    })),
    ...events.filter(e => e.status !== 'completed' && e.status !== 'cancelled').map(e => ({
      title: e.title,
      date: e.date,
      type: e.event_type?.replace(/_/g, ' '),
    })),
  ]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-4">Upcoming Deadlines</h3>
      <div className="space-y-3">
        {deadlines.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No upcoming deadlines</p>
        )}
        {deadlines.map((item, i) => {
          const daysLeft = differenceInDays(new Date(item.date), new Date())
          const overdue = isPast(new Date(item.date)) && !isToday(new Date(item.date))
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className={cn("p-2 rounded-lg", overdue ? "bg-red-50" : daysLeft <= 3 ? "bg-amber-50" : "bg-primary/10")}>
                {overdue ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">{format(new Date(item.date), 'MMM d')}</p>
                <p className={cn("text-[11px]", overdue ? "text-red-500 font-medium" : "text-muted-foreground/60")}>
                  {overdue ? 'Overdue' : isToday(new Date(item.date)) ? 'Today' : `${daysLeft}d left`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
