import React from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

const eventTypeColors = {
  meeting:      'bg-blue-50 text-blue-600 border-blue-100',
  call:         'bg-violet-50 text-violet-600 border-violet-100',
  deadline:     'bg-red-50 text-red-500 border-red-100',
  milestone:    'bg-emerald-50 text-emerald-600 border-emerald-100',
  review:       'bg-amber-50 text-amber-600 border-amber-100',
  presentation: 'bg-pink-50 text-pink-600 border-pink-100',
}

export default function UpcomingEventsThisWeek({ events = [] }) {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weekEvents = events.filter(e => {
    const d = new Date(e.date)
    return d >= weekStart && d <= weekEnd
  })

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">This Week</h3>
        <span className="text-xs text-muted-foreground">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayEvents = weekEvents.filter(e => isSameDay(new Date(e.date), day))
          const active = isToday(day)

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex flex-col gap-1.5 rounded-xl p-2 min-h-[120px]',
                active ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-muted/30'
              )}
            >
              {/* Day header */}
              <div className="flex flex-col items-center pb-1.5 border-b border-border/40">
                <span className={cn(
                  'text-[10px] font-semibold uppercase tracking-wide',
                  active ? 'text-primary' : 'text-muted-foreground/60'
                )}>
                  {format(day, 'EEE')}
                </span>
                <span className={cn(
                  'text-sm font-bold leading-tight',
                  active ? 'text-primary' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-1 flex-1">
                {dayEvents.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground/25 text-center mt-1">—</span>
                ) : (
                  dayEvents.map((e, i) => {
                    const colorClass = eventTypeColors[e.event_type] || 'bg-gray-100 text-gray-500 border-gray-200'
                    return (
                      <div
                        key={i}
                        className={cn(
                          'rounded-md px-1.5 py-1 text-[10px] font-medium border leading-tight truncate',
                          colorClass
                        )}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {weekEvents.length === 0 && (
        <div className="flex items-center justify-center gap-2 mt-3 text-muted-foreground/40">
          <CalendarDays className="w-4 h-4" />
          <span className="text-xs">No events this week</span>
        </div>
      )}
    </div>
  )
}
