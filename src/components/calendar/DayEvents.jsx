import React from 'react'
import { format, isSameDay } from 'date-fns'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const typeConfig = {
  milestone: { label: 'Milestone', className: 'bg-gray-200 text-gray-700' },
  meeting: { label: 'Meeting', className: 'bg-gray-100 text-gray-600' },
  deadline: { label: 'Deadline', className: 'bg-red-50 text-red-600' },
  review: { label: 'Review', className: 'bg-amber-50 text-amber-600' },
  delivery: { label: 'Delivery', className: 'bg-emerald-50 text-emerald-600' },
  other: { label: 'Other', className: 'bg-gray-100 text-gray-500' },
}

export default function DayEvents({ selectedDay, events }) {
  if (!selectedDay) return null
  const dayEvents = events.filter(e => isSameDay(new Date(e.date), selectedDay))

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <h3 className="font-semibold text-foreground mb-1">{format(selectedDay, 'EEEE, MMMM d')}</h3>
      <p className="text-xs text-muted-foreground mb-4">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</p>

      {dayEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No events scheduled</p>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((event, i) => {
            const type = typeConfig[event.event_type] || typeConfig.other
            return (
              <div key={i} className="p-4 rounded-xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm text-foreground">{event.title}</h4>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-2', type.className)}>{type.label}</span>
                </div>
                {event.description && <p className="text-xs text-muted-foreground mb-2">{event.description}</p>}
                <div className="flex items-center gap-3">
                  {event.time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {event.time}
                    </div>
                  )}
                  {event.project_name && <span className="text-xs text-muted-foreground/60">{event.project_name}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
